<template>
  <div class="image-container">
    <img :src="content" alt="Base64 image" />
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  // border-radius: 10px;
  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
    // border-radius: 10px;
    border: 1px solid #dadada;
  }
}
</style>