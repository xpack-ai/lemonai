<template>
  <div class="usage">
    <!-- 上部分：会员信息 -->
    <div class="account-management">
      <!-- 用户名显示与编辑按钮 -->
      <div class="username-section" style="margin-bottom: 16px;">
        <div>
          <span class="label">用户名：</span>
          <span>{{ user.user_name }}</span>
        </div>
        <button @click="openUpdateName">编辑</button>
      </div>

      <!-- 重置密码 -->
      <div class="password-reset-section">
        <span class="label">密码</span>
        <button @click="resetPassword">重置密码</button>
      </div>

    <!-- 编辑用户名弹窗 -->
    <a-modal
      centered
      title="编辑用户名"
      v-model:open="isUsernameModalVisible"
    >
      <a-input v-model:value="newUsername" placeholder="请输入新用户名" />
      <template #footer>
        <button @click="isUsernameModalVisible = false" style="background-color: #0000330f; border-color: #0000330f; color:#1a1a19; margin-right: 8px; ">取消</button>
        <button type="primary" @click="updateUsername">
          保存
        </button>
      </template>
    </a-modal>
    <!-- 重置密码弹窗 -->
    <a-modal
      centered
      title="重置密码"
      v-model:open="isPasswordModalVisible"
    >
      <a-input-password v-model:value="newPassword" placeholder="请输入密码" />
      <template #footer>
        <button @click="isPasswordModalVisible = false" style="background-color: #0000330f; border-color: #0000330f; color:#1a1a19; margin-right: 8px; ">取消</button>
        <button type="primary" @click="updatePassword">
          保存
        </button>
      </template>
    </a-modal>
  </div>
    <!-- 下部分：积分使用情况 -->
    <a-card title="订单">
      <a-table :columns="columns" @change="handleTableChange" :data-source="data" row-key="id"
        :pagination="{ current: page, pageSize: pageSize, page, total: total }" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import membershipService from '@/services/membership'
import authService from '@/services/auth'
import { useUserStore } from '@/store/modules/user.js'
const { user, membership, points } = useUserStore();
import dayjs from 'dayjs'
import { useRouter } from "vue-router";
const router = useRouter();
import { message } from 'ant-design-vue';

onMounted(() => {
  getOrderList()
})

//分页
const page = ref(1)
const pageSize = ref(5)
const total = ref(0)
const data = ref([
])
const isUsernameModalVisible = ref(false)
const newUsername = ref('')

const isPasswordModalVisible = ref(false)
const newPassword = ref('')


const openUpdateName = () =>{
  isUsernameModalVisible.value = true;
  newUsername.value = user.user_name
}

const resetPassword = async () => {
  isPasswordModalVisible.value = true;
  newPassword.value = ''
}

const updateUsername = async () => { 
  await authService.updateUsername(newUsername.value)
  isUsernameModalVisible.value = false
  user.user_name = newUsername.value
  message.success('更新成功')
}

const updatePassword = async () => { 
  await authService.resetPassword("", newPassword.value,user.mobile)
  isPasswordModalVisible.value = false
  message.success('更新成功')
}
const getOrderList = async () => {
  const res = await membershipService.getOrderList(
    { page: page.value, pageSize: pageSize.value }
  )
  console.log(res)
  total.value = res.total
  data.value = res.list
}

const handleTableChange = (pagination) => {
  page.value = pagination.current
  pageSize.value = pagination.pageSize
  getOrderList()
}
const columns = [
  {
    title: '订单编号',
    dataIndex: 'order_sn',
    key: 'order_sn'
  },
  {
    title: '订单金额',
    dataIndex: 'amount',
    key: 'amount'
  },
  {
    title: '时间',
    dataIndex: 'created_at',
    key: 'created_at',
    customRender: ({ text }) => {
      return dayjs(text).format('YYYY-MM-DD HH:mm')
    }
  },
  {
    title: '订单状态',
    key: 'status',
    customRender: ({ record }) => {
     //pending(待支付)、paid(已支付)、cancelled(已取消)、failed(支付失败)
     switch (record.status) {
       case 'pending':
         return '待支付'
       case 'paid':
         return '已支付'
       case 'cancelled':
         return '已取消'
       case 'failed':
         return '支付失败'
       default:
         return '未知'
     }
    }
  }
]


</script>

<style scoped>
.usage {
  padding: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.account-management {
  border-radius: 12px;
  padding: 1rem;
  background-color: #37352f0a;
  border: 1px solid #0000000f;
  margin-bottom: 16px;
}

.plan-name {
  font-weight: 700;
  font-size: 1rem;
  line-height: 28px;
}

.points-details {
  margin-top: 12px;
}

.points-details-text {
  font-weight: 700;
  font-size: 1rem;
  line-height: 28px;
}

.points-details-text-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-details-accounts {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expiration-date {
  color: #858481;
  line-height: 18px;
  font-size: 13px;

}

.points-accounts {
  color: #858481;
  line-height: 18px;
  font-size: 13px;
}

button {
  color: #fff;
  background-color: #1a1a19;
  padding-left: .75rem;
  padding-right: .75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  font-family: none;
}
.username-section{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-reset-section{
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.recharge-products {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background-color: #f8f8f7;
  padding: 24px;
  justify-content: space-between;
}

.product-card {
  width: calc(33.333% - 11px);
  /* 3列布局，减去间距 */
  border: 1px solid #f0f0f0;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  text-align: center;
  /* 文字居中 */
  transition: box-shadow 0.3s;
}

.product-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
<style lang="scss">
.recharge-modal {
  .ant-modal-content {
    background-color: #f8f8f7 !important;
  }

  .ant-modal-title {
    background-color: #f8f8f7 !important;
  }
}
</style>