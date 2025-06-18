<template>
    <div class="file-list" v-if="list.length"> 
        <div class="file-item" v-for="(file, index) in list" :key="index" @click="handleOpenFile(file)">
            <div class="file-icon">
                <fileSvg :url="file?.filename" :filepath="file.filepath"/>
            </div>
            <div class="file-name">{{file.filename.split('\\').pop()}}</div>
        </div>
    </div>
    <imgModal :url="imageUrl" v-model:visible="isModalVisible" @close="isModalVisible = false" />
</template>
<script setup>
import { computed,ref} from 'vue';
import fileSvg from '@/components/fileClass/fileSvg.vue'
import emitter from '@/utils/emitter';
import imgModal from '@/components/file/imgModal.vue'
import fileUtil from '@/utils/file'
import workspaceService from '@/services/workspace'
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
const isModalVisible = ref(false);
const imageUrl = ref('');
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
  if(fileUtil.imgType.includes(file.filepath.split('.').pop())){
    workspaceService.getFile(file.filepath).then(res => {
      imageUrl.value = URL.createObjectURL(res);
    })
    isModalVisible.value = true;
  }else{
    emitter.emit('fullPreviewVisable', file)
  }
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