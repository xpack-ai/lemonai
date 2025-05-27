<template>
  <div class="welcome-screen">
    <div class="welcome-header">
      <!-- <div class="icon"> 
        <img src="@/assets/image/lemon.jpg" alt="" />
        LemonAI
      </div> -->
    </div>
    <div class="welcome-content">
      <h1>{{ $t('lemon.welcome.greeting', { username }) }}</h1>
      <p>{{ $t('lemon.welcome.question') }}</p>
      <ChatInput @send="handleWelcomeInput" />
    </div>
    <!--  -->
    <Sample @sampleClick="sampleClick"/>
    <!-- 案例
    <div class="case-container">
      <div class="category-tabs">
        <a href="#" class="tab active">{{ $t('lemon.welcome.tabs.featured') }}</a>
        <a href="#" class="tab">{{ $t('lemon.welcome.tabs.research') }}</a>
        <a href="#" class="tab">{{ $t('lemon.welcome.tabs.lifestyle') }}</a>
        <a href="#" class="tab">{{ $t('lemon.welcome.tabs.dataAnalysis') }}</a>
        <a href="#" class="tab">{{ $t('lemon.welcome.tabs.education') }}</a>
        <a href="#" class="tab">{{ $t('lemon.welcome.tabs.productivity') }}</a>
        <a href="#" class="tab">{{ $t('lemon.welcome.tabs.other') }}</a>
      </div>
      <div class="case-title">
        <span>{{ $t('lemon.welcome.communityNote') }}</span>
      </div>
      <Suggestion />
    </div>
     -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Suggestion from './Suggestion.vue';
import Sample from './Sample.vue';
import ChatInput from './ChatInput.vue';
import { useChatStore } from '@/store/modules/chat';
import seeAgent from '@/services/see-agent';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import emitter from '@/utils/emitter';
import fileServices from '@/services/files'; 

const chatStore = useChatStore();
const router = useRouter();
const { t } = useI18n();

const props = defineProps({
  username: String
});


const sampleClick = (item) => {
  //触发 changeMessageText 修改数据
  emitter.emit('changeMessageText', item.content);
};

const handleWelcomeInput = async (value) => {
  console.log('handleWelcomeInput', value);
  const { text,files } = value;
  const result = await chatStore.createConversation(text);
  const { conversation_id } = result;
  if (conversation_id) {
    //处理files 的 conversation_id
    router.push(`/lemon/${conversation_id}`);
  }
  // seeAgent.sendMessage(text)
  await seeAgent.sendMessage(text,conversation_id,files);
};

</script>

<style lang="scss" scoped>
.welcome-screen {
  background: #f8f8f7;
}

.welcome-content {
  margin-top: 180px;
  margin-left: auto;
  margin-right: auto;
  max-width: 768px;
  width: 100%;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;

  h1 {
    line-height: 40px;
    font-size: 32px;
    color: #34322d;
    margin: 0px !important;

  }

  p {
    color: #858481;
    font-size: 32px;
    margin-bottom: 16px;
  }
}

.welcome-input-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.welcome-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  padding: 8px 0;

  &::placeholder {
    color: #999;
  }
}

.input-tools {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.tool-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
}

.divider {
  width: 1px;
  height: 16px;
  background: #e0e0e0;
  margin: 0 8px;
}

.send-button {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  color: #666;
  cursor: pointer;

  .arrow-icon {
    margin-left: 6px;
  }

  &:hover {
    background: #e9e9e9;
  }
}
.case-container{
  margin-top: 92px;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  padding-bottom: 100px;
}

@media (max-width: 768px) {
  .case-container{
    padding-left: 2px!important;
    padding-right: 2px!important;
  }
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
  &::-webkit-scrollbar {
    display: none;
  }
}
.case-title{
    border: 0 solid #e5e7eb;
    box-sizing: border-box;
    outline: none;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    margin: 0;
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
    text-align: center;
    font-size: .875rem;
    line-height: 1.25rem;
    color:#b9b9b7;
}

.tab {
  padding: 7px 1rem;
  border-radius: 999999px;
  border: 1px solid #0000000f;
  color: #858481;
  font-size: .875rem;
  line-height: 1.25rem;
  
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #000;
    color: #fff;
    font-weight: 600;
  }
}

.icon{
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  padding-top: 20px;

  img{
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
}

@media screen and (max-width: 768px) {
  .welcome-header{
    height: 48px;
    position: sticky;
    top: 0;
    background-color: #f8f8f7;
    z-index: 1;
  }
  .icon{
    display: none;
  }
}
</style>