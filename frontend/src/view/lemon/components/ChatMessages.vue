<template>
  <div class="chat-messages">
    <div class="message-list">
      <div v-for="message in messages" :key="message.id" class="message-item" :class="message.role">
        <div class="message-options" v-if="!isPlanOrUpdateStatus(message)">
          <div v-if="message.role === 'assistant'" class="message-title">
            <img src="@/assets/image/lemon.jpg" alt="" />
            LemonAI</div>
          <div v-else></div>
          <div style="display: flex; align-items: center; justify-content: flex-end">
            <div class="message-time display-none">{{ formatTime(message.timestamp,t) }}</div>
            <div class="copy-button display-none" @click="copyMessage(message)"  v-if="message.role === 'user'">
              <CopyOutlined />
            </div>
          </div>
       
        </div>
        <!-- 根据 message 种类渲染 -->
        <Message :message="message" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Message from '../message/index.vue';
import { useChatStore } from '@/store/modules/chat';
import { CopyOutlined } from '@ant-design/icons-vue';
import { message as messageUtil } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { onMounted, computed,ref } from 'vue';
import { formatTime } from '@/utils/time';
import Down from '@/assets/svg/down.svg';


const { t } = useI18n();
const chatStore = useChatStore();


const isShowScrollToBottom = ref(false);

const isPlanOrUpdateStatus = (message) => {
  return ['plan', 'update_status','stop','error'].includes(message.meta?.action_type);
}

onMounted(() => {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  // 防抖函数，避免 scroll 事件过于频繁触发
  let debounceTimer;
  const handleScroll = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const isNearBottom =
        chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight <= 5; // 允许误差范围
      chatStore.isScrolledToBottom = isNearBottom;
    }, 100); // 防抖时间设置为 100ms
  };

  // 添加滚动事件监听器
  chatMessages.addEventListener('scroll', handleScroll);
});

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});

// 时间格式化函数

// 复制消息
const copyMessage = (message) => {
  console.log("=== message ====",message);
  navigator.clipboard.writeText(message.content).then(() => {
    messageUtil.success(t('lemon.message.copySuccess'));
  }).catch(err => {
    console.error('Failed to copy:', err);
    messageUtil.error(t('lemon.message.copyError'));
  });
};
</script>

<style lang="scss" scoped>

.message-title{
  font-size: 16px;
  font-weight: 700;
  color: #111827;

  img{
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  // background: #f7f8fa;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
  padding-bottom: 174px;
}

.chat-messages::-webkit-scrollbar {
  display: none; /* 针对 Chrome、Safari 和 Opera */
}

.message-list {
  display: flex;
  flex-direction: column;
  // gap: 24px;
}

.message-item {
  display: flex;
  flex-direction: column!important;
  gap: 2px;

  &.assistant {
    align-self: flex-start;
    width: 100%;
  }

  &.user {
    align-self: flex-end;
    // flex-direction: row-reverse;

    .message-content {
      background: #fff;
      border: 1px solid #0000000f;
      border-radius: 12px;
      color: #34322d;
      font-size: 16px;
    }
  }

  &:hover {
    .message-options {
      .display-none {
        display: flex;
      }
    }
  }
}

.message-options {
  display: flex;
  flex-direction: row;
  color: #858481;
  font-size: 12px;
  align-items: center;
  gap: 2px;
  justify-content:space-between;
  height: 24px;
  .display-none{
    display: none;
  }
  .copy-button {
  // position: absolute;
  right: 8px;
  bottom: 8px;
  width: 24px;
  
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;

  &:hover {
    color: #666;
  }

  .icon-copy {
    font-size: 16px;
  }
}

}


.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-weight: 500;
  }
}

</style>