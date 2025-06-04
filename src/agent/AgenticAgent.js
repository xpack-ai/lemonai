require('dotenv').config();
const planning = require("@src/agent/planning/index.js");
const completeCodeAct = require("@src/agent/code-act/code-act.js");
const TaskManager = require('./TaskManager'); // assume task manager path
const resolveAutoReplyPrompt = require('@src/agent/prompt/auto_reply.js');
const resolveResultPrompt = require('@src/agent/prompt/generate_result.js');
const call = require('@src/utils/llm.js');
const Message = require('@src/utils/message.js');
const MessageTable = require('@src/models/Message')
const { Op, literal } = require("sequelize"); // 确保导入 literal
const File = require('@src/models/File')
const { getTodoMd } = require('@src/utils/planning.js');
const { write_code } = require('@src/runtime/utils/tools');
const { v4: uuidv4 } = require("uuid");
const fs = require('fs').promises;
const path = require('path')
const { getDirpath } = require('@src/utils/electron');
const WORKSPACE_DIR = getDirpath(process.env.WORKSPACE_DIR || 'workspace');

const LocalRuntime = require("@src/runtime/LocalRuntime")
const DockerRuntime = require("@src/runtime/DockerRuntime");

const RUNTIME_TYPE = process.env.RUNTIME_TYPE || 'docker';
const runtimeMap = {
  'local': LocalRuntime,
  'docker': DockerRuntime
}

const Logger = require('@src/logging/logger'); // assume logger path

class AgenticAgent {
  constructor(context = {}) {
    this.logs = [];
    this.logger = new Logger('AgenticAgent'); // assume logger path
    this.taskManager = new TaskManager('task_log.md', context.conversation_id); // assume task manager path
    this.logger.log('AgenticAgent initialized.');
    const RunTime = runtimeMap[RUNTIME_TYPE];
    this.runtime = new RunTime();
    context.runtime = this.runtime;
    this.context = context;
    this.onTokenStream = context.onTokenStream;
    this.is_stop = false;
  }

  async run(goal) {
    this.goal = goal;
    this.logger.log(`Starting agent run with goal: ${goal}`);

    try {
      if (RUNTIME_TYPE == 'docker') {
        await this.context.runtime.connect_container()
      }

      // create dir if not exists
      const dir_name = 'Conversation_' + this.context.conversation_id.slice(0, 6);
      const dir_path = path.join(WORKSPACE_DIR, dir_name);
      await fs.mkdir(dir_path, { recursive: true });

      if (this.is_stop) {
        this.logger.log('Agent stopped.');
        return;
      }
      await this.auto_reply(goal);
      if (this.is_stop) {
        this.logger.log('Agent stopped.');
        return;
      }
      // 1. Planning
      await this.plan(goal);
      if (this.is_stop) {
        this.logger.log('Agent stopped.');
        return;
      }
      // 2. Execution
      console.log('====== start execute ======')
      await this.execute();
      if (this.is_stop) {
        this.logger.log('Agent stopped.');
        return;
      }
      // 3. Final Output
      const tasks = this.taskManager.getTasks(); // assume task manager path
      const finalResult = {
        goal: this.goal,
        status: tasks.every(t => t.status === 'completed') ? 'success' : 'partial_failure',
        tasks: tasks,
        logs: this.logs
      };
      this.logger.log(`Agent run finished. Final status: ${finalResult.status}`);

      // 4. summary result
      // 递归查找目录下所有文件，包括所有子目录及更深层级的文件
      async function getAllFilesRecursively(dir) {
        let fileList = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            // 递归进入子目录
            fileList = fileList.concat(await getAllFilesRecursively(fullPath));
          } else if (entry.isFile()) {
            fileList.push(fullPath);
          }
        }
        return fileList;
      }
      let filesSet = new Set(await getAllFilesRecursively(dir_path));
      if (this.context.generate_files && Array.isArray(this.context.generate_files)) {
        for (const file of this.context.generate_files) {
          filesSet.add(file);
        }
      }
      let files = Array.from(filesSet)
      let newFiles = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.stat(file)
          return {
            filepath: file,
            filename: file.split('/').pop(),
            filesize: stats.size,
          }
        })
      )
      const prompt = await resolveResultPrompt(this.goal, tasks);
      const result = await call(prompt, this.context.conversation_id);
      const msg = Message.format({ status: 'success', action_type: 'finish_summery', content: result, json: newFiles });
      this.onTokenStream(msg);
      await Message.saveToDB(msg, this.context.conversation_id);

      return finalResult;
    } catch (error) {
      // Errors from plan or execute will be caught here
      this.logger.error(`Agent run failed: ${error.message}`);
      // Optionally update task manager log for overall failure if needed
      throw error;
      return {
        goal: this.goal,
        status: 'failed',
        error: error.message,
        logs: this.logs
      };
    }
  }

  async auto_reply(goal) {
    // Call the model to get a response in English based on the goal
    const prompt = await resolveAutoReplyPrompt(goal);
    const auto_reply = await call(prompt, this.context.conversation_id);

    const msg = Message.format({ status: 'success', action_type: "auto_reply", content: auto_reply })
    this.onTokenStream(msg);
    await Message.saveToDB(msg, this.context.conversation_id);
  }

  async plan(goal) {
    this.logger.log('Planning phase started.');
    try {
      // get files
      const files = await File.findAll({ where: { conversation_id: this.context.conversation_id } })
      this.context.files = files
      const dir_name = 'Conversation_' + this.context.conversation_id.slice(0, 6);
      // get previousResult
      const previousResult = await this.getPreviousResult()
      const plannedTasks = await planning(goal, files, previousResult, this.context.conversation_id) || [];
      // Use TaskManager to set tasks
      await this.taskManager.setTasks(plannedTasks);
      const tasks = this.taskManager.getTasks();
      const msg = Message.format({ status: 'success', action_type: "plan", content: '', json: tasks })
      this.onTokenStream(msg);
      await Message.saveToDB(msg, this.context.conversation_id);
      this.logger.log(`Planning completed. ${tasks.length} tasks generated.`);
      console.log('====== planning completed ======')

      // Write the todo list from planning to a md file
      const uuid = uuidv4()
      console.log('====== planningtasks ======')
      const todo_running_msg = Message.format({ content: "todo.md", uuid: uuid, status: 'running', action_type: 'write_code' });
      this.onTokenStream(todo_running_msg);
      await Message.saveToDB(todo_running_msg, this.context.conversation_id);
      const todo_md = await getTodoMd(tasks)
      const action = {
        type: 'write_code',
        params: {
          path: `${dir_name}/todo.md`,
          content: todo_md
        }
      }
      const result = await write_code(action, uuid)
      if (!this.context.generate_files) {
        this.context.generate_files = []
      }
      this.context.generate_files.push(result.meta.filepath)
      const planmsg = Message.format({ uuid: uuid, status: result.status, memorized: result.memorized || '', content: result.content || '', action_type: result.meta.action_type, filepath: result.meta.filepath, meta_content: todo_md });
      this.onTokenStream(planmsg);
      await Message.saveToDB(planmsg, this.context.conversation_id);

      return true; // Indicate success
    } catch (error) {

      this.logger.error(`Planning failed: ${error.message}`);
      throw new Error(`Planning failed: ${error.message}`); // Re-throw to be caught by run
    }
  }

  async getPreviousResult() {
    const dir_name = 'Conversation_' + this.context.conversation_id.slice(0, 6);

    let previousResult = ''
    const messages = await MessageTable.findAll({
      where: {
        conversation_id: this.context.conversation_id,
        meta: {
          [Op.like]: '%"action_type":"finish_summery"%'
        }
      }
    });
    console.log(this.context.conversation_id)

    if (messages && messages.length > 0) {
      for (let message of messages) {

        let fileStr = ''
        let meta = JSON.parse(message.meta)
        let files = meta.json
        if (files && files.length > 0) {
          fileStr = "All generated files:"
          let fileArray = files.map(file => {
            if (file.filepath) {
              return file.filepath.split(dir_name)[1]
            }
          })
          fileStr += JSON.stringify(fileArray)
        }

        let content = `
            ${message.content}
            ${fileStr}
            =============
          `
        previousResult += content
      }
    }
    return previousResult
  }

  async execute() {
    this.logger.log('Execution phase started.');
    const tasks = this.taskManager.getTasks(); // assume task manager path
    // console.log(JSON.stringify(tasks, null, 2))
    if (!tasks || tasks.length === 0) {
      this.logger.log('No tasks to execute.');
      return; // Nothing to execute
    }

    for (let i = 0; i < tasks.length; i++) {
      if (this.is_stop) {
        this.logger.log('Agent stopped.');
        return;
      }
      const task = tasks[i];
      // Update task status to running and log
      await this.taskManager.updateTaskStatus(task.id, 'running');
      this.logger.log(`Executing task ${task.id}: ${task.requirement}`);
      this.logs.push({ timestamp: new Date(), message: `Executing task ${task.id}: ${task.requirement}` });
      const msg = Message.format({ status: 'running', task_id: task.id, action_type: 'task' })
      this.onTokenStream(msg);
      await Message.saveToDB(msg, this.context.conversation_id);
      try {
        // Pass the current task and memory to completeCodeAct
        const result = await completeCodeAct(task, this.context);
        // Update task status to completed and log
        await this.taskManager.updateTaskStatus(task.id, 'completed', { result: result.content, memorized: result.memorized || '' });

        console.log('task', JSON.stringify(this.taskManager.getTaskById(task.id), null, 2)); // Get updated task information

        this.context.tasks = this.taskManager.getTasks(); // Update context tasks
        const uuid = uuidv4()
        const todo_running_msg = Message.format({ content: "todo.md", uuid: uuid, status: 'running', task_id: task.id, action_type: 'write_code' });
        this.onTokenStream(todo_running_msg);
        await Message.saveToDB(todo_running_msg, this.context.conversation_id);
        const new_tasks = this.taskManager.getTasks();
        const todo_md = await getTodoMd(new_tasks)
        const dir_name = 'Conversation_' + this.context.conversation_id.slice(0, 6);
        const action = {
          type: 'write_code',
          params: {
            path: `${dir_name}/todo.md`,
            content: todo_md
          }
        }
        const todoRes = await write_code(action, uuid)
        const todo_success_msg = Message.format({ uuid: uuid, status: todoRes.status, task_id: task.id, memorized: todoRes.memorized || '', content: todoRes.content || '', action_type: todoRes.meta.action_type, filepath: todoRes.meta.filepath, meta_content: todo_md });
        this.onTokenStream(todo_success_msg);
        await Message.saveToDB(todo_success_msg, this.context.conversation_id);

        this.logger.log(`Task ${task.id} completed successfully. Result: ${JSON.stringify(result)}`);
        this.logs.push({ timestamp: new Date(), status: 'completed', task: task.id, result: result });
        const msg = Message.format({ status: 'success', task_id: task.id, action_type: 'task', json: result })
        this.onTokenStream(msg);
        await Message.saveToDB(msg, this.context.conversation_id);
      } catch (error) {
        // Update task status to failed and log
        await this.taskManager.updateTaskStatus(task.id, 'failed', { error: error.message });
        this.logger.error(`Task ${task.id} failed: ${error.message}`);
        this.logs.push({ timestamp: new Date(), status: 'failed', task: task.id, error: error.message });
        const msg = Message.format({ status: 'failure', task_id: task.id, action_type: 'task', json: error })
        this.onTokenStream(msg);
        await Message.saveToDB(msg, this.context.conversation_id);
        // Decide if we should stop execution on failure or continue
        // For now, we continue to process other tasks
      }
    }
    this.logger.log('All tasks processed.');
  }

  async stop() {
    this.is_stop = true;
    const msg = Message.format({ status: 'success', action_type: 'stop' })
    this.onTokenStream(msg);
    await Message.saveToDB(msg, this.context.conversation_id);
  }
}

module.exports = AgenticAgent;