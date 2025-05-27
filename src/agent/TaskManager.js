const fs = require('fs');
const path = require('path');

const Task = require('@src/models/Task');
// 确保临时目录存在
const cache_dir = path.resolve(__dirname, '../../cache/task');
fs.mkdirSync(cache_dir, { recursive: true }); // 创建目录，如果已存在则不做任何操作

class TaskManager {
  constructor(logFilePath = 'task_log.md', conversation_id = null) {
    this.conversation_id = conversation_id;
    this.tasks = [];
    this.logFilePath = path.resolve(cache_dir, logFilePath);
    this._initializeLogFile();
  }

  async _initializeLogFile() {
    try {
      // Check if file exists, if not, create it with a header
      await fs.accessSync(this.logFilePath);
    } catch (error) {
      // File does not exist, create it with header
      await this._writeLog('# Task Execution Log\n\n');
    }
  }

  async _writeLog(content) {
    try {
      await fs.appendFileSync(this.logFilePath, content, 'utf-8');
    } catch (error) {
      console.error(`Error writing to log file ${this.logFilePath}:`, error);
      // Handle error appropriately, maybe log to console or another system
    }
  }

  _generateMarkdownLog(task, oldStatus = null) {
    const timestamp = new Date().toISOString();
    let statusEmoji = '';
    let statusText = task.status;

    switch (task.status) {
      case 'pending':
        statusEmoji = '⏳';
        break;
      case 'running':
        statusEmoji = '🚀';
        break;
      case 'completed':
        statusEmoji = '✅';
        break;
      case 'failed':
        statusEmoji = '❌';
        statusText += task.error ? `: ${task.error}` : '';
        break;
      default:
        statusEmoji = '❓'; // Unknown status
    }

    const taskDescription = task.requirement || task.description || `Task ${task.id}`;
    let logEntry = `- [${task.status === 'completed' ? 'x' : ' '}] ${statusEmoji} **${task.id}**: ${taskDescription} - Status: **${statusText}** (${timestamp})\n`;

    // Optionally add more details for completed tasks
    if (task.status === 'completed' && task.result) {
      // Keep result concise or reference it if too long
      const resultSummary = typeof task.result === 'string' && task.result.length > 100 ? task.result.substring(0, 100) + '...' : JSON.stringify(task.result);
      logEntry += `  - Result: ${resultSummary}\n`;
    }
    if (task.memorized) {
      logEntry += `  - Memorized: ${task.memorized}\n`;
    }
    return logEntry;
  }

  async setTasks(tasks) {
    this.tasks = tasks.map(item => {
      item.requirement = item.description;
      const rand_value = (Math.random() * 1000).toString()
      item.id = item.id || `${Date.now()}_${rand_value}`
      item.status = item.status || 'pending'; // Default status
      return item
    })

    const tasksToSave = this.tasks.map(task => ({
      conversation_id: this.conversation_id,
      task_id: task.id,
      requirement: task.requirement,
      status: task.status,
    }));
    await Task.bulkCreate(tasksToSave);
    // Log initial tasks
    let initialLog = `## Initial Tasks (${new Date().toISOString()})\n`;
    this.tasks.forEach(task => {
      initialLog += this._generateMarkdownLog(task);
    });
    await this._writeLog(initialLog + '\n');
  }

  getTasks() {
    return this.tasks || [];
  }

  getTaskById(taskId) {
    return this.tasks.find(t => t.id === taskId);
  }

  async updateTaskStatus(taskId, status, details = {}) {
    const task = this.getTaskById(taskId);
    if (!task) {
      console.error(`Task with ID ${taskId} not found.`);
      return;
    }

    const oldStatus = task.status;
    task.status = status;

    if (details.error) {
      task.error = details.error;
    }
    if (details.result) {
      task.result = details.result;
    }
    if (details.memorized) {
      task.memorized = details.memorized;
    }

    await Task.update({
      status: task.status,
      error: task.error,
      result: task.result,
      memorized: task.memorized,
    }, {
      where: {
        task_id: taskId
      }
    });

    // Log the status change
    const logEntry = this._generateMarkdownLog(task, oldStatus);
    await this._writeLog(logEntry);
  }

  // Method to update the entire log file based on current task states
  async regenerateFullLog() {
    let fullLog = `# Task Execution Log (Updated: ${new Date().toISOString()})\n\n`;
    this.tasks.forEach(task => {
      fullLog += this._generateMarkdownLog(task);
    });
    try {
      await fs.writeFileSync(this.logFilePath, fullLog, 'utf-8');
    } catch (error) {
      console.error(`Error regenerating log file ${this.logFilePath}:`, error);
    }
  }
}

module.exports = TaskManager;