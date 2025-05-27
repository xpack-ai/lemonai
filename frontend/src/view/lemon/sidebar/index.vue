<template>
  <div>
    <button class="menu-button" @click.stop="toggleCollapse" v-if="isCollapsed">
      <span class="menu-icon">
        <LeftList />
      </span>
      <div class="icon"> 
        <img src="@/assets/image/lemon.jpg" alt="" />
        LemonAI
      </div>
    </button>
    <div class="sidebar-container" @click="closeSidebar" v-if="!isCollapsed">
      <div class="sidebar" :class="{ 'collapsed': isCollapsed }" @click.stop="dropdownVisible = null">
        <template v-if="!isCollapsed">
          <Header @toggleCollapse="toggleCollapse" @onSearch="searchModalVisible = true" />
          <div class="sidebar-new-task">
            <button class="new-task-button" @click="newChat">
              <span class="plus-icon">
                <Add />
              </span>
              <span class="button-text">{{ $t('lemon.sidebar.newTask') }}</span>
              <!-- <span class="shortcut">
                <span class="shortcut-icon"><Command /></span>
                <span class="shortcut-text">{{ $t('lemon.sidebar.shortcutKey') }}</span>
              </span> -->
            </button>
          </div>
          <div class="sidebar-content">
            <div class="chat-list">
              <div
                v-for="chat in chatStore.list"
                :key="chat.conversation_id"
                class="chat-item"
                @click="setActiveChat(chat)"
                :class="{ 'active': chat.conversation_id === conversationId }"
              >
                <div class="chat-details">
                  <div class="chat-header">
                    <div class="chat-title">{{ chat.title }}</div>
                    <div class="chat-time">{{ formatTime(chat.update_at, t) }}</div>
                  </div>
                  <div class="chat-footer">
                    <div class="chat-last-message" :title="chat.last_message">{{ chat?.latest_message?.content }}</div>
                    <div class="more-options">
                      <a-tooltip :title="$t('lemon.sidebar.moreOptions')" placement="top" :arrow="false">
                        <More @click.stop="toggleDropdown(chat.conversation_id)" class="more-options-icon" />
                      </a-tooltip>
                      <div class="more-options-dropdown" v-if="dropdownVisible === chat.conversation_id">
                        <!-- <div class="more-options-item">
                          <Share />
                          <span class="more-options-item-text">{{ $t('lemon.sidebar.share') }}</span>
                        </div> -->
                        <div class="more-options-item" @click.stop="handleEditName(chat)">
                          <Edit />
                          <span class="more-options-item-text">{{ $t('lemon.sidebar.rename') }}</span>
                        </div>
                        <!-- <div class="more-options-item">
                          <Collect />
                          <span class="more-options-item-text">{{ $t('lemon.sidebar.collect') }}</span>
                        </div> -->
                        <div class="more-options-item err" @click="showDeleteConfirm(chat)">
                          <Delete />
                          <span class="more-options-item-text">{{ $t('lemon.sidebar.delete') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="chatStore.list.length === 0" class="no-chats">
                <Chat />
                <span>{{ $t('lemon.sidebar.noChats') }}</span>
              </div>
            </div>
          </div>
          <Footer />
        </template>
      </div>
      <a-modal
        v-model:open="deleteModalVisible"
        :title="$t('lemon.sidebar.confirmDelete')"
      >
        <p>{{ $t('lemon.sidebar.deleteConfirmation') }}</p>
        <template #footer>
          <a-button @click="handleCancel">{{ $t('lemon.sidebar.cancel') }}</a-button>
          <a-button type="primary" @click="handleDelete">{{ $t('lemon.sidebar.confirm') }}</a-button>
        </template>
      </a-modal>
      <a-modal
        :footer="null"
        :centered="true"
        v-model:open="searchModalVisible"
        @cancel="handleCancel"
        :closable="false"
      >
        <template #title>
          <div class="search-header">
            <div class="search-header-icon">
              <MenuSearch />
            </div>
            <a-input v-model:value="searchValue" :placeholder="$t('lemon.sidebar.searchPlaceholder')" />
            <div class="search-header-icon" @click="handleCancel">
              <Close />
            </div>
          </div>
        </template>
        <div class="search-content">
          <div
            v-for="chat in chatStore.list"
            :key="chat.conversation_id"
            class="chat-item"
            @click="setActiveChat(chat)"
            :class="{ 'active': chat.conversation_id === conversationId }"
          >
            <div class="chat-details">
              <div class="chat-header">
                <div class="chat-title">{{ chat.title }}</div>
                <div class="chat-time">{{ formatTime(chat.time) }}</div>
              </div>
              <div class="chat-footer">
                <div class="chat-last-message" :title="chat.last_message">{{ chat.last_message }}</div>
              </div>
            </div>
          </div>
        </div>
      </a-modal>
    </div>
  </div>

  <a-modal 
      v-model:open="open" 
      :title="$t('lemon.chatHeader.editTitle')" 
      centered  
      :width="400" 
      class="edit-title-modal" 
      :footer="null"
    > 
      <span class="edit-title">{{ $t('lemon.chatHeader.enterNewTitle') }}</span>
      <a-input v-model:value="titleValue" class="edit-title-input" />
      <footer>
        <div class="footer-btn">
          <div class="cancel-btn" @click="handleCancelEdit">{{ $t('lemon.chatHeader.cancel') }}</div>
          <div class="confirm-btn" @click="handleOkEdit">{{ $t('lemon.chatHeader.confirm') }}</div>
        </div>
      </footer>
    </a-modal>

</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Header from './Header.vue';
import Footer from './Footer.vue';
import MenuSwitch from '@/assets/svg/menuSwitch.svg';
import MenuSearch from '@/assets/svg/menuSearch.svg';
import Delete from '@/assets/svg/delete.svg';
import Share from '@/assets/svg/share.svg';
import Collect from '@/assets/svg/collect.svg';
import Edit from '@/assets/svg/edit.svg';
import Chat from '@/assets/svg/chat.svg';
import More from '@/assets/svg/more.svg';
import emitter from '@/utils/emitter';
import Command from '@/assets/svg/command.svg';
import Add from '@/assets/svg/add.svg';
import LeftList from '@/assets/svg/leftList.svg';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/modules/chat';
import { useRouter, useRoute } from 'vue-router';
import Close from '@/assets/filePreview/close.svg';
import { formatTime } from '@/utils/time';

const { t } = useI18n();
const chatStore = useChatStore();
const router = useRouter();
const route = useRoute();
const dropdownVisible = ref(null);
const open = ref(false);
const titleValue =  ref('');

const props = defineProps({
  chats: {
    type: Array,
    default: () => [],
  },
  isCollapsed: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:isCollapsed']);

const searchModalVisible = ref(false);
const conversationId = computed(() => chatStore.chat?.conversation_id);

//当前编辑的会话
const editChat = ref(null);
const handleEditName = (chat) => {
  editChat.value = chat;
  open.value = true;
  titleValue.value = chat.title;
  dropdownVisible.value = null;
};

const handleOkEdit = () => {
  open.value = false
  chatStore.updateConversationTitleById(titleValue.value,editChat.value.conversation_id);
  editChat.value = null
}

const handleCancelEdit = () => {
  open.value = false
}

const closeOtherWindows = () => {
  emitter.emit('preview-close', false);
  emitter.emit('terminal-visible', false);
  emitter.emit('fullPreviewVisable-close');
  dropdownVisible.value = null;
};

const closeSidebar = () => {
  if (isMobile.value) {
    emit('update:isCollapsed', true);
    dropdownVisible.value = null;
  }
};

const toggleDropdown = (conversationId) => {
  if (dropdownVisible.value === conversationId) {
    dropdownVisible.value = null;
  } else {
    dropdownVisible.value = conversationId;
  }
};

const handleClickOutside = (event) => {
  const moreBtn = document.querySelector('.more-options');
  if (moreBtn && !moreBtn.contains(event.target)) {
    dropdownVisible.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const newChat = () => {
  closeSidebar();
  closeOtherWindows();
  chatStore.clearMessages();
  chatStore.conversationId = null;
  router.push('/lemon');
};

const setActiveChat = (chat) => {
  closeSidebar();
  closeOtherWindows();
  chatStore.conversationId = chat.conversation_id;
  chatStore.status == "done" 
  chatStore.chat = chat;
  if (route.params.id != chat.conversation_id) {
    chatStore.clearMessages();
    chatStore.initConversation(chat.conversation_id);
    router.push(`/lemon/${chat.conversation_id}`);
  }
};

const toggleCollapse = () => {
  emit('update:isCollapsed', !props.isCollapsed);
};

const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value && !props.isCollapsed) {
    emit('update:isCollapsed', true);
  } else if (!isMobile.value && props.isCollapsed) {
    dropdownVisible.value = null;
    emit('update:isCollapsed', false);
  }
};

window.addEventListener('resize', checkMobile);
checkMobile();

const deleteModalVisible = ref(false);
const chatToDelete = ref(null);

const showDeleteConfirm = (chat) => {
  chatToDelete.value = chat;
  deleteModalVisible.value = true;
};

const handleDelete = async () => {
  if (chatToDelete.value) {
    try {
      await chatStore.removeConversation(chatToDelete.value.conversation_id);
      deleteModalVisible.value = false;
      chatToDelete.value = null;
      router.push('/lemon');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }
};

const handleCancel = () => {
  deleteModalVisible.value = false;
  chatToDelete.value = null;
};
</script>

<style lang="scss" scoped>
.menu-button {
  position: absolute;
  display: flex;
  top: 1rem;
  left: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 11;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .menu-icon { 
    max-height: 20px;
  }

}

.icon{
  display: none;
  margin-left: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;

  img{
    width: 24px;
    height: 24px;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 100vh;
  background-color: #ebebeb;
  transition: width 0.3s ease;
  overflow: hidden;

  &.collapsed {
    display: none;
    width: auto;
    background-color: transparent;

    .button-text,
    .chat-details,
    .user-name,
    .shortcut {
      display: none;
    }

    .chat-icon {
      margin-right: 0;
    }

    .new-task-button,
    .chat-item {
      justify-content: center;
    }

    .sidebar-footer {
      justify-content: center;
    }

    .footer-actions {
      display: none;
    }
  }
}


.edit-title {
  font-size: 13px;
  font-weight: 400;
  color: #858481;
}

.edit-title-input {
  margin-top: 10px;
}

.footer-btn {
  display: flex;
  padding-top: 1.25rem;
  gap: .5rem;
  justify-content: flex-end;

  .cancel-btn {
    cursor: pointer;
    font-size: 13px;
    font-weight: 400;
    color: #535350;
    font-size: .875rem;
    line-height: 1.25rem;
    padding-top: .5rem;
    padding-bottom: .5rem;
    padding-left: .75rem;
    padding-right: .75rem;
    border: 1px solid #0000001f;
    border-radius: 10px;
  }

  .confirm-btn {
    cursor: pointer;
    font-size: 13px;
    font-weight: 400;
    background: #1a1a19;
    color: #fff;
    font-size: .875rem;
    line-height: 1.25rem;
    padding-top: .5rem;
    padding-bottom: .5rem;
    padding-left: .75rem;
    padding-right: .75rem;
    border: 1px solid #ffffff33;
    border-radius: 10px;
  }
}

.search-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;

  input {
    border: unset !important;
    color: #34322d;
    font-size: 18px;
    font-weight: 400;
    line-height: 1.75rem;
  }

  .search-header-icon {
    max-width: 24px;
    max-height: 24px;
    min-width: 24px;
    min-height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 100%;
      height: 100%;
    }
  }
}

.sidebar-new-task {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0.5rem 0.5rem 1.25rem 0.5rem;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 5px;
  }
}

.new-task-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  background-color: white;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  color: #34322d;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 0 #0000, 0 0 #0000, 0px 0.5px 3px 0px #00000014;
  min-width: 36px;
  height: 36px;

  &:hover {
    background-color: #fafafa;
  }

  .plus-icon {
    width: 1rem;
    height: 1rem;
  }

  .shortcut {
    gap: 0.125em;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      padding-left: 0.25rem;
      padding-right: 0.25rem;
      background-color: #37352f0a;
      border: 1px solid #0000000a;
      border-radius: 4px;
      color: #858481;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 1.25rem;
    }
  }
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-chats {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  align-items: center;
  height: calc(100vh - 48px - 36px - 120px);
  color: #858481;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 0px 8px;
  border-radius: 10px;
  height: 56px;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: #37352f0a;
  }

  &.active {
    background-color: #fff;
  }

  .delete-button {
    display: none;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    cursor: pointer;
    padding: 4px;

    &:hover {
      color: #ff4d4f;
    }
  }

  &:hover .delete-button {
    display: block;
  }
}

.chat-details {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .more-options {
    border-radius: 6px;
    position: relative;
    width: 22px;
    height: 22px;

    .more-options-icon {
      display: none;
    }
  }

  .more-options-dropdown {
    position: absolute;
    padding: 4px;
    z-index: 999999999;
    top: 25px;
    right: -10px;
    padding: 0.25rem;
    min-width: 126px;
    border-radius: 0.75rem;
    border-width: 1px;
    border-style: solid;
    border-color: #0000001f;
    background-color: #fff;
    box-shadow: var(0 0 #0000, 0 0 #0000), var(0 0 #0000, 0 0 #0000), var(0 4px 11px 0px #00000014);

    .more-options-item {
      display: flex;
      align-items: center;
      justify-content: start;
      gap: 0.75rem;
      cursor: pointer;
      border-radius: 8px;
      color: #535350;
      font-size: 0.875rem;
      line-height: 1.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      &.err {
        color: #f25a5a;
      }
    }
  }
}

.chat-last-message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #858481;
}

.chat-title {
  font-weight: 500;
  font-size: 14px;
  color: #34322d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 8px;
}

.chat-preview {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
}

@media screen and (max-width: 768px) {
  .sidebar {
    position: absolute;
    z-index: 100;
    bottom: 10px;
    top: 10px;
    width: 300px !important;
    height: calc(100vh - 20px) !important;
    border-radius: 0.75rem;
    left: 0.25rem;
    box-shadow: 0 0 #0000, 0 0 #0000, 0px 8px 32px 0px rgba(0, 0, 0, 0.16), 0px 0px 0px 1px rgba(0, 0, 0, 0.06);
  }

  .icon{
    display:none;
  }

  .sidebar-container {
    width: 100vw;
    position: relative;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 99;
  }

  .more-options {
    border: 1px solid #0000000f;
    background-color: #fff;
    display: flex !important;
    align-items: center;
    justify-content: center;
    .more-options-icon {
      display: block !important;
    }
  }
}

@media (hover: hover) {
  .chat-item:hover .more-options {
    border: 1px solid #0000000f;
    background-color: #fff;
    display: flex !important;
    align-items: center;
    justify-content: center;
    .more-options-icon {
      display: block;
    }
  }
  .more-options-item:hover {
    background-color: #37352f0f;
  }
}
</style>

<style lang="scss">
.edit-title-modal {
  .ant-modal-header {
    margin-bottom: 5px !important;
  }
  .ant-modal-content {
    border-radius: 20px !important;
  }
}
</style>