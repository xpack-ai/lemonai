<template>
    <div class="usage">
        <!-- 上部分：会员信息 -->
        <div class="member-info">
            <div style="    display: flex;align-items: center;justify-content: space-between;">
                <div>
                    <div class="plan-name">
                        {{ membership?.planName || '免费'}}
                    </div>
                    <!-- 到期时间 -->
                    <div class="expiration-date" v-if="membership">
                        到期时间：{{ dayjs(membership.endDate).format('YYYY-MM-DD HH:mm') }}
                    </div>
                </div>
                <div style="gap:12px;display: flex;">
                    <button @click="toMember" class="upgrade">升级</button>
                    <button @click="toPoints" v-if="membership" class="upgrade">购买积分</button>
                </div>
            </div>

            <!-- 积分详情 -->
            <div class="points-details">
              <div class="points-details-text-container">
                <div class="points-details-text">积分</div>
                <div class="points-details-total">{{ points.total }}</div>
              </div>
              <div>
                <div class="points-details-accounts" v-for="item in points.accounts">
                  <div class="points-accounts">{{ getPointsTypeName(item.type) }}</div>
                  <div class="points-accounts">{{ item.balance }}</div>
                </div>
              </div>
             
            </div>

        </div>

        <!-- 下部分：积分使用情况 -->
        <a-card title="积分使用记录">
            <a-table :columns="columns" @change="handleTableChange" :data-source="data" row-key="id"
                :pagination="{ current: page, pageSize: pageSize, page, total: total }" />
        </a-card>
    </div>

    <a-modal
    v-model:visible="isModalVisible"
    title="购买积分"
    :footer="null"
    width="800px"
    class="recharge-modal"
    centered
  >
    <div v-if="rechargeProducts.length" class="recharge-products">
      <div
        v-for="item in rechargeProducts"
        :key="item.id"
        class="product-card"
      >
        <div class="product-title">{{ item.product_name }}</div>
        <div class="product-info">
          <p style="margin-top: 8px;">¥{{ item.amount }}</p>
          <p>{{ item.points_awarded }}积分</p>
        </div>
        <button size="small" :loading="loading" @click="handleBuy(item)">立即购买</button>
      </div>
    </div>
    <div v-else>暂无可用的积分套餐</div>
  </a-modal>
  <a-modal v-model:visible="showQrCode" title="微信扫码支付" centered :footer="null">
  <div style="text-align: center;">
    <div style="display: inline-block;">
      <a-qrcode :value="qrCodeUrl" :size="200" />
    </div>
    <p style="margin-top: 12px;">请使用微信扫码完成支付</p>
  </div>
</a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import membershipService from '@/services/membership'
import { useUserStore } from '@/store/modules/user.js'
const { user, membership, points } = useUserStore();
import dayjs from 'dayjs'
import { useRouter } from "vue-router";
const router = useRouter();
import { message  } from 'ant-design-vue';

onMounted(() => {
    getPointsTransactionList()
})

//分页
const page = ref(1)
const pageSize = ref(5)
const total = ref(0)
const data = ref([
])

const showQrCode = ref(false)
const qrCodeUrl = ref('')
const pollingTimer = ref(null)
const loading = ref(false)

const isModalVisible = ref(false)
const rechargeProducts = ref([])

//返回积分类型对应的名称
//FREE: 免费积分, MONTHLY: 月度积分, PURCHASED_ADDON: 购买附加积分, GIFTED_ADDON: 赠送附加积分, FEEDBACK_ADDON: 反馈的附加积分
function getPointsTypeName(type) {
  switch (type) {
    case 'FREE':
      return '免费积分'
    case 'MONTHLY':
      return '月度积分'
    case 'PURCHASED_ADDON':
      return '购买附加积分'
    case 'GIFTED_ADDON':
      return '赠送附加积分'
    case 'FEEDBACK_ADDON':
      return '反馈的附加积分'
  }
}


const handleBuy = async (item) => {
  loading.value = true
  let res = await membershipService.createPointPurchaseOrder(item.id)

  if (res && res.code_url) {
    loading.value = false
    qrCodeUrl.value = res.code_url
    showQrCode.value = true
    checkOrderStatus(res.order_sn)
  } else {
    loading.value = false
    // 你可以使用 a-message 错误提示
    // message.error("生成二维码失败，请稍后重试")
    console.error("二维码生成失败", res)
  }
  //checkOrderStatus 轮询 orderSn
  console.log(res)
}

const checkOrderStatus = async (orderSn) => {
  const maxRetries = 20
  let attempts = 0

  pollingTimer.value = setInterval(async () => {
    attempts++

    const res = await membershipService.checkOrderStatus(orderSn)
    if (res?.status === 'paid') {
      clearInterval(pollingTimer.value)
      showQrCode.value = false
      message.success("支付成功！")
      paySuccess();
      // message.success("支付成功！")
      console.log('支付成功')
    }

    if (attempts >= maxRetries) {
      clearInterval(pollingTimer.value)
      console.warn("支付超时，请重新下单")
    }
  }, 3000)
}

//支付成功 
const paySuccess = () => {
 //刷新当前页面
 window.location.reload()
}

const getPointsTransactionList = async () => {
    const res = await membershipService.getPointsTransactionList(
        { page: page.value, pageSize: pageSize.value }
    )
    console.log(res)
    total.value = res.pagination.total
    data.value = res.list
}

const handleTableChange = (pagination) => {
    page.value = pagination.current
    pageSize.value = pagination.pageSize
    getPointsTransactionList()
}

const toMember = () => {
    router.push({ name: "pricing" });
};

const toPoints =  async () => {
    let res = await membershipService.getRechargeProductList()
    rechargeProducts.value = res || []
    isModalVisible.value = true
};

const columns = [
    {
        title: '详情',
        dataIndex: 'description',
        key: 'description'
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
        title: '积分变动',
        key: 'amount',
        customRender: ({ record }) => {
            const prefix = record.type === 'credit' ? '+' : record.type === 'debit' ? '-' : ''
            return `${prefix}${record.amount}`
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

.member-info {
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
.points-details{
  margin-top: 12px;
}
.points-details-text{
    font-weight: 700;
    font-size: 1rem;
    line-height: 28px;
}
.points-details-text-container{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.points-details-accounts{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expiration-date {
    color: #858481;
    line-height: 18px;
    font-size: 13px;

}

.points-accounts{
    color: #858481;
    line-height: 18px;
    font-size: 13px;
}

button {
    color: #fff;
    background-color: #1a1a19;
    padding-left: .75rem;
    padding-right: .75rem;
    border-radius: 99999px;
    cursor: pointer;
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
  width: calc(33.333% - 11px); /* 3列布局，减去间距 */
  border: 1px solid #f0f0f0;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  text-align: center; /* 文字居中 */
  transition: box-shadow 0.3s;
}

.product-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
<style lang="scss">
.recharge-modal {
  .ant-modal-content {
    background-color: #f8f8f7!important;
  }
  .ant-modal-title{
    background-color: #f8f8f7!important;
  }
}
</style>