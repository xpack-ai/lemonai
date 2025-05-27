<template>
  <div style="display: flex; align-items: center;" v-if="message.role === 'assistant' && message.is_temp && !message.meta">
   {{ content }} <LoadingDots />
  </div>
  <div v-else-if="message?.meta?.action_type === 'plan'">
    <Markdown :content="content" />
    <Planing :planing="message?.meta?.json" />
  </div>
  <div v-else-if="message?.meta?.action_type === 'update_status'">
    <LoadingOutlined />
    <span style="margin-left: 5px;">{{ content }}</span>
  </div>
  <!-- 停止 -->
  <div v-else-if="message?.meta?.action_type === 'stop'" class="stop">
    <Stop/> <span>LemonAI {{ t('stop_task') }}</span>
  </div>
  <!-- 任务异常 完成 -->
  <div v-else-if="message?.meta?.action_type === 'error'" class="error">
    <Failure/> <span>{{ t('task_error') }}:{{ message?.content }}</span>
  </div>
  <Markdown v-else :content="content"  />
  <!-- <span>{{ message }}</span> -->
  <!-- 文件列表 -->
  <div v-if="message?.meta?.action_type === 'finish_summery' || message?.meta?.action_type === 'question' "> 
      <MessageFileList :message="message" :role="message.role" />
  </div>

</template>

<script setup>
import { computed } from 'vue'
import Markdown from '@/components/markdown/index.vue'
import LoadingDots from '@/view/lemon/components/LoadingDots.vue'
import { LoadingOutlined } from '@ant-design/icons-vue'
import Planing from '@/view/lemon/message/Planing.vue'
import MessageFileList from '@/components/MessageFileList/index.vue'
import Stop from '@/assets/message/stop.svg'
import Failure from '@/assets/message/failure.svg'
const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const content = computed(() => {
  return props.message.content
})

</script>

<style lang="scss" scoped>
code {
  max-width: 600px;
}

.stop{
  display: flex;
  color:#EFA201;
  padding-top: 5px;
  padding-bottom: 5px;
  border-radius: 100px;
  gap: .375rem;
  padding-left: .75rem;
  padding-right: .75rem;
  background-color: #efa2011f;
  line-height: 18px;
  font-size: 13px;
  width: max-content;
  align-items: center;
}

.error {
  display: flex;
  color:#f25a5a;
  padding-top: 5px;
  padding-bottom: 5px;
  border-radius: 100px;
  gap: .375rem;
  padding-left: .75rem;
  padding-right: .75rem;
  background-color: #efa2011f;
  line-height: 18px;
  font-size: 13px;
  width: max-content;
  align-items: center;
}
</style>
