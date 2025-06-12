<template>
  <div class="sidebar-footer">
    <div class="user-profile">
      <div class="avatar">
        <User />
      </div>
      <div class="user-name">{{ user.user_name || user.mobile || user.user_email }}</div>
      <div class="opDiv" ><!-- v-if="opShow" -->
        <UserProFile />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import service from '@/services/default-model-setting'
import userService from '@/services/auth'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user.js'
import User from '@/assets/sidebar/user.svg'
const { user,membership,points } = useUserStore();

const router = useRouter();
const opShow = ref(true);

const { t } = useI18n()
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import UserProFile from '@/view/auth/components/user-profile.vue'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const tour = async () => {
  const tourDriver = driver({
    animate: true,
    showProgress: true,
    prevBtnText: t('setting.prevStep'),
    nextBtnText: t('setting.nextStep'),
    doneBtnText: t('setting.doneStep'),
    steps: [
      {
        element: '#setting',
        popover: {
          side: 'bottom',
          title: t('setting.settingModel'),
          description: t('setting.settingModelTips'),
          onNextClick: async () => {
            nextTick(() => {
              //设置缓存 结束引导
              localStorage.setItem('tour_end', 'true');
              tourDriver.moveNext()
            })
          },
        }
      }
    ]
  });

  tourDriver.drive();
}

//checkModel

//检查是否配置模型
async function checkModel() {
  //判断有没有 localStorage.setItem('tour_end', 'true');
  if (localStorage.getItem('tour_end') == 'true') {
    localStorage.setItem('tour', 'false');
    return;
  }
  let res = await service.checkModel();
  if (res.has_default_platform && res.has_enabled_platform && res.has_search_setting) {
    localStorage.setItem('tour', 'false');
  } else {
    localStorage.setItem('tour', 'true');
    tour();
  }
}

//获取用户信息 getUserInfo
async function getUserInfo() {
  let res = await userService.getUserInfo();
  //设置缓存
  useUserStore().setMembership(res.membership);
  useUserStore().setPoints(res.points);
}

onMounted(() => {
  nextTick(() => {
    checkModel();
    getUserInfo();
  });
});
//判断有没有登录
const isLogined = computed(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    return false;
  }
  return true;
});
const toLogin = () => {
  router.push({ path: '/auth' });
};

const toLoginOut = () => {
  localStorage.removeItem('access_token');
  //刷新页面
  location.reload();
};

const toSetting = () => {
  router.push({ path: '/setting/basic' });
};

</script>

<style lang="scss" scoped>
.opDiv {
  position: absolute;
  background: #fff;
  display: none;
  z-index: 9999;
  border-radius: 6px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, .08), 0 8px 24px 0 rgba(0, 0, 0, .04);
  bottom: 35px;
  left: 16px;
  font-size: 12px;
  width: 298px;
  padding: 10px 16px;

  div {
    border-radius: 6px;
  }

  span {
    margin-right: 8px;
  }

  img {
    margin-right: 5px;
  }
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;

  &:hover {
    .opDiv {
      display: block;
    }
  }
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.footer-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: space-between;
}

.footer-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
}

.login {
  border: 1px solid #666;
  background: unset;
  font-size: 14px;
  border-radius: 20px;
  height: 32px;
  cursor: pointer;
  min-width: 64px
}
</style>