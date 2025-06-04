// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息到主进程 (用于单向通信)
  send: (channel, data) => {
    // 限制允许的 IPC 通道（白名单）
    // 请根据您的实际需求添加或修改通道名
    const validSendChannels = ['setup-complete-load-main'];
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // 监听主进程的消息 (用于主进程 -> 渲染进程通信)
  on: (channel, callback) => {
    // 限制允许的 IPC 通道
    // 请根据您的实际需求添加或修改通道名
    const validOnChannels = ['from-main', 'api-response', 'setup-status', 'start-setup-process']; // 添加 setup-status 和 start-setup-process
    if (validOnChannels.includes(channel)) {
      // 使用 once: true 避免内存泄漏，渲染进程重新加载时自动清理
      // 注意：这里直接将 args 传递给 callback，event 参数被忽略
      const subscription = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      // 返回一个取消监听的函数，方便清理
      return () => ipcRenderer.removeListener(channel, subscription);
    } else {
        console.warn(`ipcRenderer.on: Channel "${channel}" is not whitelisted.`);
        return () => {}; // 返回一个空的取消函数
    }
  },
  // 可选：移除监听器
  removeListener: (channel, callback) => {
    const validOnChannels = ['from-main', 'api-response', 'setup-status', 'start-setup-process']; // 与 on 的白名单一致
    if (validOnChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
  // 调用主进程的 handle 方法 (用于双向通信)
  invoke: (channel, ...args) => {
    // 限制允许的 IPC 通道
    // 请根据您的实际需求添加或修改通道名
    const validInvokeChannels = ['start-docker-setup']; // 添加您在主进程中处理的通道名
    if (validInvokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    } else {
        console.warn(`ipcRenderer.invoke: Channel "${channel}" is not whitelisted.`);
        return Promise.reject(new Error(`Channel "${channel}" is not allowed.`)); // 返回一个拒绝的 Promise
    }
  }

});