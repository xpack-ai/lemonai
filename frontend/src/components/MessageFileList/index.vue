<template>
    <div class="file-list" v-if="list.length"> 
        <div class="file-item" v-for="(file, index) in list" :key="index" @click="handleOpenFile(file)">
            <div class="file-icon">
                <fileSvg :url="file?.filename"/>
            </div>
            <div class="file-name">{{file.filename.split('\\').pop()}}</div>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue';
import fileSvg from '@/components/fileClass/fileSvg.vue'
import emitter from '@/utils/emitter';
    const props = defineProps({
        message: {
          type: Array,
          default: () => []
        },
      role: {
        type: String,
        default: 'assistant'
      }

    })

const list = computed(() => {
  let data = JSON.parse(JSON.stringify(props.message.meta.json));
  if (data) {
    data.forEach(item => {
      if (item.filepath) {
        item.filename = item.filepath.split("/").pop(); // 从路径中取文件名
      } else {
        item.filename = item.name || ""; // 没有 name 的话就设为空字符串
      }
    });
  }
  return data;
})

// 打开文件
const handleOpenFile = (file) => {
  emitter.emit('fullPreviewVisable', file)
}
</script>
<style>
.file-list {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
  max-width: 568px;
  margin-top: 16px;
}

.file-item {
  display: flex;
  padding: .5rem;
  background-color: #37352f0f;
  border-radius: 10px;
  gap: .375rem;
  align-items: center;
  cursor: pointer;
  width: 280px;

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

</style>