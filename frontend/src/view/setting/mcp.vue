<template>
  <div class="mcp-service">
    <h2>{{$t('setting.mcpService.title')}}</h2>
     <McpServer/>
  </div>

</template>

<script setup>
import McpServer from '@/components/mcpServer/index.vue'

</script>
<style scoped>
.mcp-service {
  padding: 16px;
}

@media screen and (max-width: 768px) {
 h2{
  display: none;
 }
 .mcp-service{
  padding: 0!important;
 }
}
</style>