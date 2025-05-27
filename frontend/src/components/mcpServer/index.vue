<template>
  <div class="mcp-server-contianer">
    <div class="mcp-server-menu">
      <div class="mcp-server-add-container menu-item" @click="handleAddServer">
        <PlusOutlined />
        <span class="menu-item-lable">{{ $t('setting.mcpService.addServer') }}</span>
      </div>
      <div v-for="mcpserver in mcpServerList" :key="mcpserver.id" class="menu-item" @click="handleMcpServer(mcpserver)">
        <CodeOutlined />
        <span class="menu-item-lable">{{ mcpserver.name }}</span>
        <span class="menu-item-status"
          :class="mcpserver.activate ? 'menu-item-status-on' : 'menu-item-status-off'"></span>
      </div>
    </div>
    <div class="map-server-menu-mobile">
      <div class="mcp-server-add-container menu-item" @click="handleAddServer">
        <PlusOutlined />
        <span class="menu-item-lable">{{ $t('setting.mcpService.addServer') }}</span>
      </div>
      <a-select v-model="chooseMCPServer.id" @change="handleMcpServer" style="width: 100%; margin-bottom: 12px;">
        <a-select-option v-for="mcpserver in mcpServerList" :key="mcpserver.id" :value="mcpserver.id">
          <CodeOutlined />
          <span class="menu-item-lable">{{ mcpserver.name }}</span>
          <span class="menu-item-status"
            :class="mcpserver.activate ? 'menu-item-status-on' : 'menu-item-status-off'"></span>
        </a-select-option>
      </a-select>
    </div>
    <div class="mcp-server-content" v-if="!searchMCPVisable">
      <div class="mcp-server-content-header">
        <div style="display: flex;    align-items: center;">
          <span class="mcp-server-content-header-title">{{ chooseMCPServer.name }}</span>
          <DeleteOutlined class="mcp-server-content-header-delete-button" />
        </div>
        <div style="display: flex;    align-items: center;">
          <a-switch v-model="chooseMCPServer.activate" class="mcp-server-content-header-activate-switch" />
          <div class="mcp-server-content-header-save-button-container">
            <a-button type="primary" @click="handleMCPServerSave" class="mcp-server-content-header-save-button">
              <SaveOutlined />
              {{ $t('setting.mcpService.save') }}
            </a-button>
          </div>
        </div>


      </div>
      <div class="mcp-server-content-main">
        <div class="mcp-server-content-main-name mcp-server-content-main-item">
          <span>{{ $t('setting.mcpService.name') }}</span>
          <a-input v-model:value="chooseMCPServer.name" :placeholder="$t('setting.mcpService.namePlaceholder')"
            class="text-item input" />
        </div>
        <div class="mcp-server-content-main-description mcp-server-content-main-item">
          <span>{{ $t('setting.mcpService.description') }}</span>
          <a-textarea v-model:value="chooseMCPServer.description" :rows="4"
            :placeholder="$t('setting.mcpService.descriptionPlaceholder')" class="text-item" />
        </div>
        <div class="mcp-server-content-main-type mcp-server-content-main-item">
          <span>{{ $t('setting.mcpService.type') }}</span>
          <a-radio-group v-model:value="chooseMCPServer.type" name="radioGroup" class="input radio">
            <a-radio value="stdio">{{ $t('setting.mcpService.stdio') }}</a-radio>
            <a-radio value="sse">{{ $t('setting.mcpService.sse') }}</a-radio>
            <a-radio value="streamableHttp">{{ $t('setting.mcpService.streamableHttp') }}</a-radio>
          </a-radio-group>
        </div>
        <div class="mcp-server-content-main-commond mcp-server-content-main-item">
          <span>{{ $t('setting.mcpService.command') }}</span>
          <a-input v-model:value="chooseMCPServer.commond" :placeholder="$t('setting.mcpService.commandPlaceholder')"
            class="text-item input" />
        </div>
        <div v-if="startsWithNpx || startsWithUvx" class="mcp-server-content-main-source mcp-server-content-main-item">
          <span>{{ $t('setting.mcpService.packageSource') }}</span>
          <a-radio-group v-if="startsWithNpx" v-model:value="chooseMCPServer.registryUrl" name="radioGroup"
            class="input radio">
            <a-radio value="">{{ $t('setting.mcpService.default') }}</a-radio>
            <a-radio value="https://registry.npmmirror.com">{{ $t('setting.mcpService.taobaoNpmMirror') }}</a-radio>
          </a-radio-group>
          <a-radio-group v-if="startsWithUvx" v-model:value="chooseMCPServer.registryUrl" name="radioGroup"
            class="input radio">
            <a-radio value="">{{ $t('setting.mcpService.default') }}</a-radio>
            <a-radio value="https://pypi.tuna.tsinghua.edu.cn/simple">{{ $t('setting.mcpService.tsinghua') }}</a-radio>
            <a-radio value="http://mirrors.aliyun.com/pypi/simple/">{{ $t('setting.mcpService.aliyun') }}</a-radio>
            <a-radio value="https://mirrors.ustc.edu.cn/pypi/simple/">{{ $t('setting.mcpService.ustc') }}</a-radio>
            <a-radio value="https://repo.huaweicloud.com/repository/pypi/simple/">{{
              $t('setting.mcpService.huaweiCloud') }}</a-radio>
            <a-radio value="https://mirrors.cloud.tencent.com/pypi/simple/">{{ $t('setting.mcpService.tencentCloud')
            }}</a-radio>
          </a-radio-group>
        </div>
        <div class="mcp-server-content-main-args mcp-server-content-main-item">
          <span>{{ $t('setting.mcpService.args') }}</span>
          <a-textarea v-model:value="argsText" :rows="4" :placeholder="$t('setting.mcpService.argsPlaceholder')"
            class="text-item" @update:value="handleArgsChange" />
        </div>
        <div class="mcp-server-content-main-env mcp-server-content-main-item">
          <span>{{ $t('setting.mcpService.env') }}</span>
          <a-textarea v-model:value="envText" :rows="4" :placeholder="$t('setting.mcpService.envPlaceholder')"
            class="text-item" @update:value="handleEnvChange" />
        </div>
        <div class="mcp-server-content-main-moreshow mcp-server-content-main-item"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusOutlined, CodeOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons-vue'
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchMCPVisable = ref(true)
const chooseMCPServer = ref({
  id: 1,
})
const argsText = ref('')
const envText = ref('')

const handleArgsChange = (value) => {
  if (!value) {
    chooseMCPServer.value.args = []
    return
  }
  chooseMCPServer.value.args = value.split('\n').filter(arg => arg.trim() !== '')
}

const handleEnvChange = (value) => {
  if (!value) {
    chooseMCPServer.value.env = {}
    return
  }
  const envObj = {}
  value.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine) {
      const [key, ...values] = trimmedLine.split('=')
      const trimmedKey = key.trim()
      const trimmedValue = values.join('=').trim()
      if (trimmedKey && trimmedValue) {
        envObj[trimmedKey] = trimmedValue
      }
    }
  })
  chooseMCPServer.value.env = envObj
}

const formatArgsText = (args) => {
  return Array.isArray(args) ? args.join('\n') : ''
}

const formatEnvText = (env) => {
  return Object.entries(env || {}).map(([key, value]) => `${key}=${value}`).join('\n')
}

const handleMcpServer = (mcpserver) => {
  chooseMCPServer.value = mcpserver
  argsText.value = formatArgsText(mcpserver.args)
  envText.value = formatEnvText(mcpserver.env)
}

const startsWithNpx = computed(() => {
  if (chooseMCPServer.value != null) {
    return chooseMCPServer.value.commond.startsWith("npx")
  }
})

const startsWithUvx = computed(() => {
  if (chooseMCPServer.value != null) {
    return chooseMCPServer.value.commond.startsWith("uv")
  }
})

const mcpServerList = ref([
  {
    id: 1,
    name: t('setting.mcpService.mcpServer'),
    description: t('setting.mcpService.mcpServer'),
    activate: false,
    type: "stdio",
    commond: "uvx",
    registryUrl: "",
    args: [],
    env: {}
  },
  {
    id: 2,
    name: t('setting.mcpService.mcpServer'),
    description: t('setting.mcpService.mcpServer'),
    activate: false,
    type: "streamableHttp",
    commond: "uvx or npx",
    registryUrl: "",
    args: [],
    env: {}
  },
  {
    id: 3,
    name: t('setting.mcpService.mcpServer'),
    description: t('setting.mcpService.mcpServer'),
    activate: true,
    type: "sse",
    commond: "npx",
    registryUrl: "",
    args: [],
    env: {}
  }
])

onMounted(() => {
  if (mcpServerList.value.length > 0) {
    chooseMCPServer.value = mcpServerList.value[0]
    searchMCPVisable.value = false
  } else {
    searchMCPVisable.value = true
  }
})

const handleMCPServerSave = () => {
  // TODO: Implement save logic
}

const handleAddServer = () => {
  const newServer = {
    id: mcpServerList.value.length + 1,
    name: t('setting.mcpService.mcpServer'),
    description: t('setting.mcpService.mcpServer'),
    activate: false,
    type: "stdio",
    commond: "uvx",
    registryUrl: "",
    args: [],
    env: {}
  }
  mcpServerList.value.push(newServer)
  chooseMCPServer.value = newServer
  searchMCPVisable.value = false
}
</script>

<style scoped lang="scss">
.mcp-server-contianer {
  width: 100%;
  display: flex;
  flex-direction: row;
  // padding: 1px;
  padding-bottom: 40px;

}

.mcp-server-menu {
  padding: 16px 0;
  width: fit-content;
  background: white;
  height: 100%;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.map-server-menu-mobile {
  display: none;
}

.mcp-server-menu::-webkit-scrollbar {
  width: 6px;
}

.mcp-server-menu::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.mcp-server-menu::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 0px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  padding-left: 12px;
  padding-right: 12px;
}

.menu-item:hover {
  background: #f0f0f0;
}

.menu-item-lable {
  margin-left: 10px;
  font-size: 14px;
  width: 150px;
}

.menu-item-status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 20px;
}

.menu-item-status-on {
  background-color: rgb(18, 229, 18);
}

.menu-item-status-off {
  background-color: rgb(114, 112, 112);
}

.mcp-server-content {
  padding: 0px 16px;
  width: 100%;
  background-color: rgb(255, 255, 255);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.mcp-server-content::-webkit-scrollbar {
  width: 6px;
}

.mcp-server-content::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.mcp-server-content::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}

.mcp-server-content-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  justify-content: space-between;
}

.mcp-server-content-header-title {
  font-size: 18px;
  font-weight: bold;
}

.mcp-server-content-header-delete-button {
  margin-left: 15px;
  cursor: pointer;
  color: rgb(223, 44, 44);
  width: 20px;
  height: 20px;
  justify-content: center;
}

.mcp-server-content-header-delete-button:hover {
  background-color: rgb(255, 239, 255);
  transition: all 0.6s ease-in-out;
}

.mcp-server-content-header-save-button-container {
  margin-left: 12px;
}

.text-item {
  width: 100%;
  font-size: 14px;
}

.mcp-server-content-main-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;

  span:first-child {
    margin-bottom: 12px;
  }
}

.radio {
  font-size: 15px;
}

@media screen and (max-width: 768px) {
  .map-server-menu-mobile {
    display: block;
  }

  .mcp-server-menu {
    display: none;
  }

  .mcp-server-contianer {
    flex-direction: column;
  }

  .mcp-server-content {
    width: 100% !important;
  }

  .ant-radio-group {
    display: inline-grid !important;
  }

  .mcp-server-content {
    padding: 0px !important;
  }

  .mcp-server-content-header-save-button-container {
    button {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100% !important;
      border: unset !important;
      border-radius: unset !important;
      z-index: 1000;
      height: 40px !important;

    }

    margin-left: 0 !important;

  }
}
</style>