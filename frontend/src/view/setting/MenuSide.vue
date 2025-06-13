<template>
  <div class="menu-side">
    <div 
      v-for="item in menuItems"
      :id="item.key" 
      :key="item.key"
      class="menu-item"
      :class="{active: $route.path.endsWith(item.key)}"
      @click="handleMenuClick(item)"
    >
      <component :is="item.icon" class="menu-icon" />
      <span>{{ $t(item.name) }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import emitter from '@/utils/emitter';
import auth from '@/services/auth';
import { useUserStore } from '@/store/modules/user.js'
const { user,membership,points } = useUserStore();
import { SettingOutlined,ProjectOutlined, ApiOutlined, DeploymentUnitOutlined as ModelOutlined , GlobalOutlined,AppstoreOutlined ,InfoCircleOutlined} from '@ant-design/icons-vue'
const route = useRoute()
const router = useRouter()
// 菜单项配置说明：
// - basic: 基本设置页面 /setting/basic
// - default-model-setting: 默认模型配置页面 /setting/default-model-setting
// - model-service: 模型服务配置页面 /setting/model-service
// - search-service: 搜索服务配置页面 /setting/search-service
// - mcp-service: MCP服务配置页面 /setting/mcp-service
let menuItems = [
  { key: 'basic', name: 'setting.menu.basic', icon: SettingOutlined },
  // { key: 'default-model', name: $t('setting.menu.defaultModel'), icon: ModelOutlined }, // 暂时不显示
  // { key: 'default-model', name: $t('setting.menu.defaultModel'), icon: ModelOutlined }, // 弃用
  { key: 'model-service', name: 'setting.menu.modelService', icon: ApiOutlined },
  { key: "search-service", name: 'setting.menu.searchService', icon: GlobalOutlined },
  // { key: 'default-model-setting', name: 'setting.menu.defaultModel', icon: ModelOutlined },
  { key:'experience',name:'setting.menu.experience',icon: AppstoreOutlined },
  // { key: "mcp-service", name: 'setting.menu.mcpService', icon: CodeOutlined }, // 暂时不显示
  { key: 'about', name: 'setting.menu.about', icon:  InfoCircleOutlined }
]


//判断有没有登录 使用情况 Usage
//判断有没有登录
const init  = async () => { 
  if(user.id) {
    //menuItems 给 menuItems 添加一条数据 放在第二位置 
    menuItems.splice(1, 0, { key: 'usage', name: '使用情况', icon: ProjectOutlined });
  }
};

init();

//菜单点击事件
const handleMenuClick = (item) => {
  emitter.emit('closeTour');
  //全局事件关闭引导
  emitter.emit('changeMessageText');
  router.push(`/setting/${item.key}`)
}
</script>

<style scoped>
.menu-side {
  width: 200px;
  padding: 16px 0;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}
.menu-item:hover {
  background: #37352f0f;
}
.menu-item.active {
  background: #37352f0f;
}
.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

@media screen and (max-width: 768px) {
  .menu-side{
    display: flex;
    width: max-content!important;
    padding: 0!important;
    border-right: none!important;
    .menu-item{ 
      span:first-child{
        display: none!important;
      }
    }
  }

  
}
</style>