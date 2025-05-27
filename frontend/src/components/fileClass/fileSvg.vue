<template>
    <img v-if="isImageType" :src="img" alt="" class="file-icon" />
    <component v-else :is="iconComponent" class="file-icon" />
</template>

<script setup>
import { computed, ref } from 'vue'
import PptIcon from '@/assets/fileClass/ppt.svg?component'
import TextIcon from '@/assets/fileClass/txt.svg?component'
import CodeIcon from '@/assets/fileClass/code.svg?component'
// import DefaultIcon from '@/assets/fileClass/default.svg?component'

const props = defineProps({
    url: {
        type: String,
        default: ''
    }
})

const fileTypes = {
    ppt: {
        extensions: ['ppt', 'pptx','pdf'],
        component: PptIcon
    },
    text: {
        extensions: ['txt', 'md'],
        component: TextIcon
    },
    code: {
        extensions: ['js', 'ts', 'html', 'css', 'vue','py','rb','go','sql','yaml','yml','php','sh','bash','cs','rs','kt','scala'],
        component: CodeIcon
    }
}

const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp']

const img = ref('')
// Check if the file type is an image
const isImageType = computed(() => {
    if (imageTypes.includes(props.url.split('.').pop().toLowerCase())){
        // TODO 图片文件 对URL处理获取图片Base64

        img.value = ''
        return true
    }
    return false
})

// Determine which icon component to render for non-image files
const iconComponent = computed(() => {
    const extension = props.url.split(".").pop().toLowerCase()
    for (const [_, config] of Object.entries(fileTypes)) {
        if (config.extensions.includes(extension)) {
            return config.component
        }
    }
    // return 返回文本文件图标
    return TextIcon
})
</script>

<style scoped>
.file-icon {
    display: block;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    box-sizing: border-box;
    border: 0 solid #e5e7eb;
    width: 32px; 
    height: 32px;
}
</style>