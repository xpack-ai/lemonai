<template>
  <div class="chat-panel">
    <!-- 通过 route.params.id来渲染聊天框-->
    <template v-if="conversationId">
      <div class="chat-panel-content">
      <ChatHeader :title="currentChat?.title" @share="handleShare" />
      <ChatMessages :messages="messages" />
      <ChatInput @send="handleSendMessage" />
      <div class="scroll-to-bottom" @click="scrollToBottom" v-if="isShowScrollToBottom">
        <Down />
      </div>
      <!-- 拟态框  文件资源预览-->
      <!-- <fullPreview/> -->
      </div>
    </template>
    <Welcome v-else />
    <fileClass/>
  </div>


</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import ChatHeader from './ChatHeader.vue'
import ChatMessages from './ChatMessages.vue'
import ChatInput from './ChatInput.vue'
import seeAgent from '@/services/see-agent';
import { useChatStore } from '@/store/modules/chat';
import fullPreview from '@/components/preview/fullPreview.vue';
import Down from '@/assets/svg/down.svg';
import fileClass from '@/components/preview/fileClass.vue';
const chatStore = useChatStore();

import { useRoute } from 'vue-router'
const route = useRoute();
import Welcome from './Welcome.vue';
import { timestamp } from '@vueuse/core';

// 发送消息
const handleSendMessage =async (value) => {
  const { text, mode,files } = value
  await seeAgent.sendMessage(text,chatStore.chat.conversation_id,files);
}

const conversationId = ref(route.params.id);
watchEffect(() => {
  conversationId.value = route.params.id;
  if(!route.params.id){
    chatStore.conversationId = null;
    chatStore.chat = null;
    chatStore.messages = [];
  }
})

// src/context/ws-client-provider.tsx
const currentChat = computed(() => chatStore.chat)
const inputText = ref('')
const messages = computed(() => chatStore.messages)

const isShowScrollToBottom = ref(false);

onMounted(() => {
  //添加滚动事件监听
  const chatMessages = document.querySelector('.chat-messages');
  if(!chatMessages) return false;
  chatMessages.addEventListener('scroll', () => {
    if(chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight > 200){
      isShowScrollToBottom.value = true;
    }else{
      isShowScrollToBottom.value = false;
    }
  })
})

const scrollToBottom = () => {
  const chatMessages = document.querySelector('.chat-messages');
  if(!chatMessages) return false;
  chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.clientHeight;
}


const viewEvents = () => {
  // 从 store 获取 events 数据
  const events = chatStore.events;
  // 将数据转换为 JSON 字符串，使用缩进格式化
  const json = JSON.stringify(events, null, 2);
  // 创建 Blob 对象
  const blob = new Blob([json], { type: 'application/json' });
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  // 创建一个临时的 a 标签用于下载
  const link = document.createElement('a');
  link.href = url;
  link.download = `chat-events-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  // 添加到文档中并触发点击
  document.body.appendChild(link);
  link.click();
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}






const showConfirm = ref(false)

const handleShare = () => {
  // 处理分享逻辑
}

const handleWelcomeInput = () => {
  showConfirm.value = true;
}

const handleAcceptConfirm = () => {
  showConfirm.value = false
  // 创建新的对话
  currentChat.value = {
    id: Date.now(),
    title: inputText.value
  }

  // 初始化对话消息
  messages.value = [{
    id: Date.now(),
    type: 'user',
    sender: username.value,
    content: inputText.value,
    time: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }]

  // 清空输入
  inputText.value = ''
}

const handleRejectConfirm = () => {
  showConfirm.value = false
}

</script>

<style lang="scss" scoped>
.chat-panel::-webkit-scrollbar {
  display: none; /* 针对 Chrome、Safari 和 Opera */
}

.chat-panel-content {
  width: 100%;
  height: 100%;
}

@media (min-width: 640px) {
  .chat-panel-content {
    max-width: 768px!important;
    min-width: 390px!important;
    margin-left: auto;
    margin-right: auto;
  }
}

.chat-panel {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */
}


.scroll-to-bottom{
  border: 1px solid #0000000f;
  background: #fff;
  position: sticky;
  bottom: 150px;
  z-index: 1000;
  left: 50%;
  border-radius: 9999999px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 5px 16px 0px #00000014,0px 0px 1.25px 0px #00000014;
}
</style>