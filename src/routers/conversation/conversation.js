const router = require("koa-router")();
require("module-alias/register");

const Conversation = require("@src/models/Conversation");
const Message = require("@src/models/Message");
const call = require("@src/utils/llm");
const resolveGenerateTitlePrompt = require("@src/agent/prompt/generate_title");
const planning_model_type = 'assistant';

const uuid = require("uuid");
const { Op } = require("sequelize");

// Create a new conversation
/**
 * @swagger
 * /api/conversation:
 *   post:
 *     summary: Create a new conversation
 *     tags:  
 *       - Conversation
 *     description: This endpoint creates a new conversation with the provided content.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Conversation content
 *     responses:
 *       200:
 *         description: Successfully created a new conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: './schemas/conversation.json'
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 *                 
 */
router.post("/", async ({ request, response }) => {
  const body = request.body || {};
  const { content } = body

  const conversation_id = uuid.v4();
  const title = 'Conversation' + conversation_id.slice(0, 6);
  const newConversation = await Conversation.create({
    conversation_id: conversation_id,
    content: content,
    title: title,
    status: 'running'
  });

  return response.success(newConversation);
});

// Get conversation list
/**
 * @swagger
 * /api/conversation:
 *   get:
 *     summary: Get conversation list
 *     tags:  
 *       - Conversation
 *     description: This endpoint retrieves a list of all conversations ordered by update time in descending order.
 *     responses:
 *       200:
 *         description: Successfully returned the conversation list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: './schemas/conversation.json'
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 *               
 */
router.get("/", async ({ response }) => {
  try {
    let new_conversations = []
    const conversations = await Conversation.findAll({ order: [['update_at', 'DESC']] });
    for (let conversation of conversations) {
      const latest_message = await Message.findOne({
        order: [['create_at', 'DESC']],
        where: {
          conversation_id: conversation.conversation_id
        }
      });
      new_conversations.push({
        ...conversation.toJSON(),
        latest_message: latest_message
      })
    }

    return response.success(new_conversations);
  } catch (error) {
    console.error(error);
    return response.error("Failed to get conversation list");
  }
});

// Get a single conversation
/**
 * @swagger
 * /api/conversation/{conversation_id}:
 *   get:
 *     summary: Get a single conversation
 *     tags:  
 *       - Conversation
 *     description: This endpoint retrieves a single conversation by its unique identifier.
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         description: Unique identifier for the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully returned the conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: './schemas/conversation.json'
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 */
router.get("/:conversation_id", async ({ params, response }) => {
  const { conversation_id } = params;
  try {
    const conversation = await Conversation.findOne({
      where: { conversation_id: conversation_id },
    });
    if (!conversation) {
      return response.fail("Conversation does not exist");
    }
    return response.success(conversation);
  } catch (error) {
    console.error(error);
    return response.fail("Failed to get conversation");
  }
});

// Update conversation
/**
 * @swagger
 * /api/conversation/{id}:
 *   put:
 *     summary: Update conversation
 *     tags:  
 *       - Conversation
 *     description: This endpoint updates the title of a conversation by its unique identifier.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier for the conversation
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New conversation title
 *     responses:
 *       200:
 *         description: Successfully updated the conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: './schemas/conversation.json'
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 */
router.put("/:id", async ({ params, request, response }) => {
  const { id: conversation_id } = params;
  const body = request.body || {};
  let { title } = body;

  try {
    const conversation = await Conversation.findOne({
      where: { conversation_id: conversation_id },
    });
    if (!conversation) {
      return response.error("Conversation does not exist");
    }

    if (!title || title === "") {
      title = await auto_generate_title(conversation)
    }
    conversation.title = title;
    await conversation.save();
    return response.success(conversation);
  } catch (error) {
    console.error(error);
    return response.fail("Failed to update conversation");
  }
});

// Delete conversation
/**
 * @swagger
 * /api/conversation/{conversation_id}:
 *   delete:
 *     summary: Delete conversation
 *     tags:  
 *       - Conversation
 *     description: This endpoint deletes a conversation by its unique identifier.
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         description: Unique identifier for the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: string
 *                   description: Success message
 */
router.delete("/:conversation_id", async ({ params, response }) => {
  const { conversation_id } = params;
  try {
    const conversation = await Conversation.findOne({
      where: { conversation_id: conversation_id },
    });
    if (!conversation) {
      return response.error("Conversation does not exist");
    }
    await conversation.destroy();
    return response.success("Conversation deleted successfully");
  } catch (error) {
    console.error(error);
    return response.error("Failed to delete conversation");
  }
});

// search conversation
/**
 * @swagger
 * /api/conversation/query:
 *   post:
 *     summary: Search conversation by title
 *     tags:  
 *       - Conversation
 *     description: This endpoint searches for conversations by title.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Conversation title
 *     responses:
 *       200:
 *         description: Successfully searched for conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: './schemas/conversation.json'
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 *                 
 */
router.post("/query", async ({ request, response }) => {
  const body = request.body || {};
  const { query } = body

  const conversations = await Conversation.findAll({
    where: {
      title: {
        [Op.like]: `%${query}%`
      }
    }
  });

  return response.success(conversations);
});

const resolveThinking = require("@src/utils/thinking");

async function auto_generate_title(conversation) {
  console.log(conversation)
  const prompt = await resolveGenerateTitlePrompt(conversation.content);
  const content = await call(prompt, conversation.conversation_id, planning_model_type, {
    temperature: 0,
  });
  // handle thinking model result
  if (content && content.startsWith('<think>')) {
    const { thinking: _, content: title } = resolveThinking(content);
    return title;
  }
  return content;
}

module.exports = exports = router.routes();