// @ts-ignore
const router = require("koa-router")();
const handleStream = require("@src/utils/stream.util");

const uuid = require("uuid");
const Conversation = require("@src/models/Conversation");
const AgenticAgent = require("@src/agent/AgenticAgent");
const Message = require("@src/utils/message");
const File = require('@src/models/File')
const path = require('path')
const fs = require('fs').promises
const { getDirpath } = require('@src/utils/electron');
const WORKSPACE_DIR = getDirpath(process.env.WORKSPACE_DIR || 'workspace');
const activeAgents = new Map();

/**
 * @swagger
 * /api/agent/run:
 *   post:
 *     tags:
 *       - Agent
 *     summary: Execute code task and push results in real-time via SSE
 *     description: |
 *       Receives client-submitted `question`, constructs a task, and calls `completeCodeAct` to execute code.
 *       Based on `responseType` (default SSE), streams each token to the frontend.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: User's question or instruction
 *               conversation_id:
 *                 type: string
 *                 description: Conversation ID, used to identify the current conversation
 *               fileIds:
 *                 type:json
 *             required:
 *               - question
 *     responses:
 *       200:
 *         description: 流式响应开启
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: SSE 数据流，每条数据为一个 token
 */
router.post("/run", async (ctx, next) => {
  const { request, response } = ctx;
  const body = request.body || {};
  let { question, conversation_id, fileIds } = body;
  let files = [];

  const dir_name = 'Conversation_' + conversation_id.slice(0, 6);
  const dir_path = path.join(WORKSPACE_DIR, dir_name);
  await fs.mkdir(dir_path, { recursive: true });

  if (Array.isArray(fileIds) && fileIds.length > 0) {
    for (const fileId of fileIds) {
      await File.update(
        { conversation_id: conversation_id },
        { where: { id: fileId } }
      );
    }
    files = await File.findAll({
      where: {
        id: fileIds
      }
    });

    // 根据文件名把文件从 upload文件夹内，移动到 dir_name下面的upload文件夹内
    const uploadDir = path.join(WORKSPACE_DIR, 'upload');
    const targetUploadDir = path.join(dir_path, 'upload');
    await fs.mkdir(targetUploadDir, { recursive: true });

    for (const file of files) {
      // 假设 file.filename 字段存在，且为文件名
      const srcPath = path.join(uploadDir, file.name);
      const destPath = path.join(targetUploadDir, file.name);

      try {
        // 尝试移动文件，如果目标已存在则覆盖
        await fs.rename(srcPath, destPath);
      } catch (err) {
        if (err.code === 'EXDEV' || err.code === 'EEXIST') {
          // 跨分区或已存在，尝试复制再删除
          await fs.copyFile(srcPath, destPath);
          await fs.unlink(srcPath);
        } else {
          // 其他错误抛出
          throw err;
        }
      }
    }
  }



  if (!conversation_id) {
    conversation_id = uuid.v4();
    const title = 'Conversation_' + conversation_id.slice(0, 6);
    const newConversation = await Conversation.create({
      conversation_id: conversation_id,
      content: question,
      title: title,
      status: 'running'
    });
  }

  body.responseType = body.responseType || "sse";
  const { stream, onTokenStream } = handleStream(body.responseType, response);
  const onCompleted = () => {
    stream.end();
  };
  const context = {
    onTokenStream,
    conversation_id
  }

  const agent = new AgenticAgent(context);
  activeAgents.set(conversation_id, agent);
  agent.run(question).then(async (content) => {
    console.log('content', content);
    onCompleted();
    activeAgents.delete(conversation_id);
  }).catch(async (error) => {
    const msg = Message.format({ status: 'success', action_type: 'error', content: error.message });
    onTokenStream(msg);
    await Message.saveToDB(msg, conversation_id);
    console.error('Agent run error:', error);
    onCompleted();
    activeAgents.delete(conversation_id);
  });

  for (let file of files) {
    file.filename = file.name
    file.filepath = path.join(dir_path, file.url)
  }

  const newFiles = files.map(file => {
    let obj = file.dataValues
    obj.filename = obj.name
    obj.filepath = path.join(dir_path, obj.url)
    return obj
  })
  const msg = Message.format({
    role: 'user',
    status: 'success',
    content: question,
    action_type: 'question',
    task_id: conversation_id,
    json: newFiles
  });
  await Message.saveToDB(msg, conversation_id);


  // completeCodeAct(task, context).then(async content => {
  //   console.log('content', content);
  //   onCompleted();
  // });
  ctx.body = stream;
  ctx.status = 200;
});

/**
 * @swagger
 * /api/agent/stop:
 *   post:
 *     tags:
 *       - Agent
 *     summary: 停止正在执行的 Agent 任务
 *     description: |
 *       接收一个 `conversation_id` 并尝试停止对应的 AgenticAgent 实例。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 description: 要停止的 Agent 的对话 ID
 *             required:
 *               - conversation_id
 *     responses:
 *       200:
 *         description: Agent 成功停止或未找到活跃 Agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 */
router.post("/stop", async ({ request, response }) => {
  const { conversation_id } = request.body || {};

  const agent = activeAgents.get(conversation_id);

  await Conversation.update({ status: 'done' }, { where: { conversation_id: conversation_id } });
  if (agent) {
    try {
      if (typeof agent.stop === 'function') {
        await agent.stop(); // 假设你的 AgenticAgent 类有一个 stop 方法
        activeAgents.delete(conversation_id); // 停止后从 Map 中移除
        response.success('Agent is stopped')
      } else {
        response.fail('Agent has no stop method')
      }
    } catch (error) {
      response.fail(`Error stopping Agent ${conversation_id}: ${error.message}`)
    }
  } else {
    response.fail(`Agent with conversation_id ${conversation_id} not found`)
  }
});

module.exports = exports = router.routes();