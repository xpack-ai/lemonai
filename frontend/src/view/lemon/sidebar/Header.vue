<template>
  <div class="sidebar-header">
    <div class="icon">
      <img src="@/assets/image/lemon.jpg" alt="" />
      LemonAI
    </div>
    <div class="sidebar-header-btn">
      <button class="menu-button" @click.stop="toggleCollapse">
        <span class="menu-icon">
          <MenuSwitch />
        </span>
      </button>
      <button class="search-button">
        <span class="search-icon">
          <MenuSearch @click="onSearch" />
        </span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import MenuSwitch from '@/assets/svg/menuSwitch.svg';
import MenuSearch from '@/assets/svg/menuSearch.svg';

const emit = defineEmits(['toggleCollapse', 'onSearch']);
const toggleCollapse = () => {
  console.log('toggleCollapse');
  emit('toggleCollapse');
};

const onSearch = () => {
  emit('onSearch');
};

</script>

<style lang="scss" scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .75rem .75rem 0.5rem .75rem;
}

.sidebar-header-btn {
  display: flex;
  align-items: center;
  padding-left: .25rem;
  padding-right: .25rem;
  padding-top: .5rem;
  height: 28px;
}

.menu-button,
.search-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: .375rem;
  width: 28px;
  height: 28px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}


.icon {
  font-size: 16px;
  font-weight: 700;
  color: #111827;

  img {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
}
</style>