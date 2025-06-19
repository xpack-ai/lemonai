const fs = require('fs');
const path = require('path');

// ensure the temporary directory exists
const { getDirpath } = require('@src/utils/electron');
const cache_dir = getDirpath('Caches/memory');
fs.mkdirSync(cache_dir, { recursive: true }); // create directory, do nothing if it already exists

class LocalMemory {
  constructor(options = {}) {
    this.options = options;
    this.memory_dir = options.memory_dir;
    if (this.memory_dir) {
      const dir = path.resolve(cache_dir, this.memory_dir);
      fs.mkdirSync(dir, { recursive: true }); // create directory, do nothing if it already exists
    }
    this.key = options.key; // primary key ID
    console.log(`LocalMemory initialized with key: ${this.key}`);
  }

  _getFilePath() {
    if (this.memory_dir) {
      const dir = path.resolve(cache_dir, this.memory_dir);
      return path.resolve(dir, `${this.key}.json`);
    }
    // use this.key as the file name, store in the specified temporary directory
    return path.resolve(cache_dir, `${this.key}.json`);
  }

  async _loadMemory() {
    const filePath = this._getFilePath();
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // if the file does not exist or there is an error reading it, return an empty array
      if (error.code !== 'ENOENT') {
        console.error(`Error reading memory file for ${this.key}:`, error);
      }
      return [];
    }
  }

  async _saveMemory(messages) {
    const filePath = this._getFilePath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');
      console.log(`Memory for task ${this.key} saved successfully.`);
    } catch (error) {
      console.error(`Error saving memory file for ${this.key}:`, error);
      throw new Error(`Failed to save memory for task ${this.key}`);
    }
  }

  async addMessage(role, content, action_type = '', memorized = false) {
    // 1. load message list
    const messages = await this._loadMemory();
    // 2. add new message
    messages.push({ role, content, action_type, memorized });
    // 3. save message list
    await this._saveMemory(messages);
  }

  async getMessages() {
    const messages = await this._loadMemory();
    return messages;
  }

  async clearMemory() {
    const filePath = this._getFilePath();
    try {
      await fs.unlinkSync(filePath);
      console.log(`Memory for task ${this.key} cleared successfully.`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // file does not exist, be considered as cleared
        console.log(`No memory file found for task ${this.key} to clear.`);
      } else {
        console.error(`Error clearing memory file for ${this.key}:`, error);
        throw new Error(`Failed to clear memory for task ${this.key}`);
      }
    }
  }

  // get memorized content
  async getMemorizedContent() {
    // 1. load message list
    const messages = await this._loadMemory();
    // 2. extract content
    const list = [];
    for (const message of messages) {
      const { action_type = '', memorized } = message;
      if (!memorized) {
        continue; // skip non-memorized message
      }
      list.push(`${action_type.toUpperCase()}: ${message.content}`);
    }
    return list.join('\n');
  }
}

module.exports = LocalMemory;