const router = require("koa-router")();

const Message = require("@src/models/Message");


// api/message/list?conversation_id=1234567890
/**
 * @swagger
 * /api/message/list:
 *   get:
 *     summary: Get message list
 *     tags:  
 *       - Message
 *     description: This endpoint retrieves a list of messages.
 *     parameters:
 *       - in: query
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the conversation to retrieve messages for.
 *     responses:
 *       200:
 *         description: A list of messages.
 */
router.get("/list", async ({ query, response }) => {
    const { conversation_id } = query;
    if (!conversation_id) {
        return response.error("Missing conversation_id");
    }
    const messages = await Message.findAll({
        where: { conversation_id: conversation_id }
    });
   
    return response.success(messages);
});




module.exports = exports = router.routes();