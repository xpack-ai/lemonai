<template>
  <div class="pricing-page">
    <div class="header">
      <h1 class="title">定价</h1>

      <div class="billing-toggle">
        <a-segmented v-model:value="billingType" :options="billingOptions" size="large" />
      </div>
    </div>

    <div class="pricing-cards">
      <a-row :gutter="24" justify="center">
        <a-col :xs="24" :sm="24" :md="8" :lg="8" v-for="plan in pricingPlans" :key="plan.id">
          <a-card class="pricing-card" :class="{ popular: plan.popular, recommended: plan.recommended }" bordered>
            <div class="plan-badge" v-if="plan.popular || plan.recommended">
              <a-tag :color="plan.popular ? '#722ed1' : '#1890ff'">
                {{ plan.popular ? '最受欢迎' : '推荐' }}
              </a-tag>
            </div>

            <div class="plan-header">
              <h3 class="plan-name">{{ plan.plan_name }}</h3>
              <div class="discount-badge" v-if="billingType === 'year' && plan.discount">
                <a-tag :color="plan.discountColor">
                  {{ plan.discount }}% 折扣 年付
                </a-tag>
              </div>
            </div>

            <div class="pricing" style="text-align:center; margin: 20px 0;">
              <div class="price">
                <!-- ¥{{ displayedPrices[plan.id] }}/{{ billingType === 'month' ? '月' : '年' }} -->
                ¥{{ plan.price }}
              </div>
            </div>

            <div class="credits">
              <div class="credits-amount">
                {{ plan.monthly_points.toLocaleString() }} 积分 /月
              </div>
              <!-- <p class="credits-note">未使用积分不会结转</p> -->
            </div>

            <div class="features" v-if="false">
              <h4 class="features-title">AI 模型</h4>
              <a-list size="small" :data-source="plan.features">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta>
                      <template #avatar>
                        <a-icon type="check" style="color: #52c41a;" />
                      </template>
                      <template #title>
                        <span>{{ item }}</span>
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
            </div>

            <div class="cta">
              <a-button :loading="loading" type="primary" size="large" block :class="{ 'popular-btn': plan.popular }" @click=pay(plan)>
                选择 {{ plan.name }}
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
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
import { ref, reactive, watch, onBeforeUnmount, onMounted } from 'vue'
import membershipService from '@/services/membership'

const billingType = ref('year')
const billingOptions = [
  { label: '月付', value: 'month' },
  { label: '年付', value: 'year' },
]

const pricingPlans = ref([])
const showQrCode = ref(false)
const qrCodeUrl = ref('')
const pollingTimer = ref(null)
const loading = ref(false)


const checkOrderStatus = async (orderSn) => {
  const maxRetries = 20
  let attempts = 0

  pollingTimer.value = setInterval(async () => {
    attempts++

    const res = await membershipService.checkOrderStatus(orderSn)
    if (res?.status === 'paid') {
      clearInterval(pollingTimer.value)
      showQrCode.value = false
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

const pay = async (plan) => {
  loading.value = true
  let res = await membershipService.createOrder(plan.id)

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

//支付成功 跳转到首页
const paySuccess = () => {
  router.push('/')
}

const getMembershipPlan = async () => {
  let res = await membershipService.getList()
  pricingPlans.value = res;
  console.log(res)
}

onMounted(() => {
  getMembershipPlan();
});

// 显示的价格，初始化为当前 billingType 对应价格
const displayedPrices = reactive({})
// 计时器容器，用于清除定时器
const timers = {}

// 初始化显示价格为月付价
// pricingPlans.forEach(plan => {
//   displayedPrices[plan.id] = plan.price[billingType.value]
// })

// 数字动画函数
function animatePrice(planId, from, to, duration = 500) {
  if (timers[planId]) {
    clearInterval(timers[planId])
  }
  const frameRate = 30
  const totalFrames = Math.round(duration / (1000 / frameRate))
  let frame = 0
  const diff = to - from

  timers[planId] = setInterval(() => {
    frame++
    if (frame >= totalFrames) {
      displayedPrices[planId] = to
      clearInterval(timers[planId])
      timers[planId] = null
    } else {
      displayedPrices[planId] = Math.round(from + (diff * frame) / totalFrames)
    }
  }, 1000 / frameRate)
}

// 监听 billingType 改变，触发动画
watch(billingType, (newType, oldType) => {
  pricingPlans.forEach(plan => {
    animatePrice(plan.id, displayedPrices[plan.id], plan.price[newType])
  })
})

onBeforeUnmount(() => {
  // 清除所有定时器
  Object.values(timers).forEach(timer => {
    if (timer) clearInterval(timer)
  })
  if (pollingTimer.value) clearInterval(pollingTimer.value)
})
</script>

<style scoped>
.pricing-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 42px;
  font-weight: bold;
  color: #1f1f1f;
  margin-bottom: 20px;
}

.billing-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.pricing-cards {
  margin-bottom: 60px;
}

.pricing-card {
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s;
  background-color: #fff;
  position: relative;
}

.pricing-card:hover {
  transform: translateY(-6px);
}

.plan-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

.plan-header {
  text-align: center;
  padding-top: 24px;
}

.plan-icon {
  font-size: 40px;
}

.plan-name {
  font-size: 20px;
  font-weight: 600;
  margin: 8px 0;
}

.discount-badge {
  margin-top: 8px;
}

.pricing {
  text-align: center;
  margin: 20px 0;
}

.price {
  font-size: 32px;
  font-weight: bold;
  color: #1a1a1a;
  transition: all 0.3s ease;
}

.credits {
  text-align: center;
  margin-top: 12px;
}

.credits-amount {
  font-size: 16px;
  font-weight: 500;
  color: #444;
}

.credits-icon {
  margin-right: 6px;
}

.credits-note {
  font-size: 12px;
  color: #aaa;
}

.features {
  margin-top: 20px;
  padding: 0 12px;
}

.features-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.cta {
  margin-top: 20px;
  padding: 0 12px 20px;
}

.popular-btn {
  background-color: #722ed1;
  border-color: #722ed1;
}
</style>
