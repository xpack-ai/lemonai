<template>
    <pdfPreview v-if="fileExtendName==='pdf' " :pdfArrayBuffer="content"/>
</template>
<script setup>
import { computed, defineProps } from 'vue';
import pdfPreview from '@/components/office/pdfPreview.vue';
const props = defineProps({
  content: {
    type: [ArrayBuffer],
    default:  null
  },
  filename: {
    type: String,
    default:  ""
  },
})

const fileExtendName = computed(() => {
  return props.filename.split('.').pop();
});
</script>
<style>

</style>