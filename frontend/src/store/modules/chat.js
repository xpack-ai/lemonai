import { defineStore } from 'pinia'
import { io } from "socket.io-client";
import chat from '@/services/chat';
const baseUrl = import.meta.env.VITE_WS_API_URL;

import emitter from '@/utils/emitter';
import messageFun from '@/services/message';
import i18n from '@/locals';
import { set } from '@vueuse/core';


export const useChatStore = defineStore('chat', {
  state: () => ({
    list: [],
    chat: {},
    messages: [],
    events: [],
    agent: {
      status: 'idle',
      message: ''
    },
    status: 'done',
    conversationId: null,
    socket: null,
    baseUrl: baseUrl,
    commands: [],
    isScrolledToBottom: true,
    updateTitle: true,
    //停止回放
    stopReplay: false,
  }),
  actions: {
    async init() {
      const res = await chat.list()
      //处理一下排序 最近的排在前面
      let data = res || [];
      data.sort((a, b) => {
        return new Date(b.update_at) - new Date(a.update_at);
      });

      this.list = data;
    },
    async handleStop(){
      let res = await chat.stop(this.conversationId)
      console.log('handleStop', res);
      this.status = 'done'
    },
    clearMessages() {
      // console.log('clearMessages', this.messages);
      this.messages = [];
      this.isScrolledToBottom = true;
      this.status == "done"; 
    },
    async initConversation(conversationId) {
      this.messages = [];
      let res = await chat.messageList(conversationId);
      //循环 res
      res.forEach(item => {
        messageFun.handleMessage(item, this.messages);
      });
      this.scrollToBottom();
    },
    //消息回放
    async playback(conversationId, time = 0) { // 确保函数声明时包含 async 关键字
      this.stopReplay = false;
      this.status = 'running';
      this.messages = [];
      const get_res = await chat.get(conversationId);
      this.chat = get_res;
      let res = await chat.messageList(conversationId);
      for (let item of res) { // 使用 for...of 循环来遍历数组
           //延迟时间
          let  delay = 100;
          if(!this.stopReplay){
            await new Promise(resolve => setTimeout(resolve, time)); // 正确使用 await 来等待 Promise 完成
            delay = 0;
          }
          messageFun.handleMessage(item, this.messages); // 假设 handleMessage 是正确导入或定义的
          setTimeout(() => {
            //判断是否打开预览  emitter.emit('preview',{})
            emitter.emit('preview',{ message: item })
            //finish_summery
            let meta = JSON.parse(JSON.stringify(item.meta));
            //json
            let file = meta?.json[0] || {};
            console.log('meta.action_type',meta.action_type);
            if(meta.action_type == "finish_summery" && file){
              console.log('file',file);
              emitter.emit('fullPreviewVisable',file)
            }
          }, delay);
          
          this.isScrolledToBottom = true;
          this.scrollToBottom(0);
      }
      this.status = 'done';
    },
    async toResult(){
      this.status = 'done';
      this.stopReplay = true;
    },
    async autoTitle() {
      if (this.updateTitle) {
        // 更新 title
        const update_res = await chat.update(this.conversationId, "");
        console.log('update_res', update_res);
        //调用get 获取最新的会话
        const get_res = await chat.get(this.conversationId);
        this.chat.title = get_res.title;
        //修改 list
        this.list.find(item => item.conversation_id === this.conversationId).title = get_res.title;
        this.updateTitle = false;
      }
    },
    async updateConversationTitle(title) {
      const update_res = await chat.update(this.conversationId, title);
      // console.log('update_res', update_res);
      this.chat.title = title;
      this.list.find(item => item.conversation_id === this.conversationId).title = get_res.title;
    },
    onMessageEvent(data) {
      // this.socket.emit('oh_event', data);
      const { source, message } = data;
      // console.log('onMessageEvent', data);
    },
    handleEnvironmentEvent(data) {
      const { source, message, action, observation, args = {}, extras = {} } = data;
      if (action === 'change_agent_state') {
        const { agent_state } = args;
        // console.log('agent.args', args, message);
        this.agent.status = agent_state;
        this.agent.message = message;
      }
      if (observation === 'agent_state_changed') {
        const { agent_state } = extras;
        // console.log('agent.extras', extras, agent_state);
        this.agent.status = agent_state;
        this.agent.message = message;
      }
    },
    // 创建新会话
    async createConversation(message) {
      this.messages = []; // 清空消息
      this.updateTitle = true;
      const result = await chat.create(message);
      this.chat = result;
      this.conversationId = result.conversation_id;
      console.log('result', result);
      this.init();
      this.autoTitle();
      return result;
    },
    // 发送消息
    sendMessage(message) {
    },
    //message
    handleInitMessage(content,files) {
      console.log('handleInitMessage', content);
      const message = {
        content: content,
        //meta.json
        //action_type === 'question' 
        meta:{
          json:files,
          action_type:'question'
        },
        role: 'user',
        //临时标记
        is_temp: true,
      }
      this.messages.push(message);

      const bot_message = {
        content: i18n.global.t('lemon.message.botInitialResponse'),
        role: 'assistant',
        is_temp: true,
      }
      this.messages.push(bot_message);
      this.isScrolledToBottom = true;
      this.scrollToBottom();
    },
    async removeConversation(conversationId) {
      // if (this.socket) {
      //   this.socket.close();
      // }
      const result = await chat.remove(conversationId);
      let index = this.list.findIndex(item => item.conversation_id === conversationId);
      if (index !== -1) {
        this.list.splice(index, 1);
      }
      return result;
    },
    scrollToBottom(time = 500) {
      setTimeout(() => {
        console.log('scrollToBottom', this.isScrolledToBottom);
        //将消息滚动到最底部
        const messageList = document.querySelector('.chat-messages');
        if (this.isScrolledToBottom) {
          messageList.scrollTop = messageList.scrollHeight - messageList.clientHeight;
          // console.log('scrollToBottom', messageList.scrollTop, messageList.scrollHeight, messageList.clientHeight);
        }
      }, time);
    },
    async favorite() {
      const result = await chat.favorite(this.conversationId);
      this.chat.is_favorite = true;
    },
    async unfavorite() {
      const result = await chat.unfavorite(this.conversationId);
      this.chat.is_favorite = false;
    }
  },
  persist: true,
})
