<template>
  <div class="top-bar">
    <a-button type="text" @click="back">
      <template #icon>
        <arrow-left-outlined />
      </template>
      {{ $t('setting.back') }}
    </a-button>
  </div>
  <div class="pricing-page">
    <div class="header">
      <h1 class="title">{{ $t('member.pricing') }}</h1>

      <div class="billing-toggle">
        <a-segmented
          v-model:value="billingType"
          :options="billingOptions"
          size="large"
        />
      </div>
    </div>

    <div class="pricing-cards">
      <a-row :gutter="24" justify="center" v-if="filteredPlans.length">
        <a-col
          :xs="24"
          :sm="24"
          :md="8"
          :lg="8"
          v-for="plan in pricingPlans"
          :key="plan.id"
        >
          <a-card
            class="pricing-card"
            :class="{ popular: plan.popular, recommended: plan.recommended }"
            bordered
          >
            <div class="plan-badge" v-if="plan.popular || plan.recommended">
              <a-tag :color="plan.popular ? '#722ed1' : '#1890ff'">
                {{
                  plan.popular
                    ? $t('member.mostPopular')
                    : $t('member.recommended')
                }}
              </a-tag>
            </div>

            <div class="plan-header">
              <h3 class="plan-name">{{ plan.plan_name }}</h3>
              <div
                class="discount-badge"
                v-if="billingType === 'year' && plan.discount"
              >
                <a-tag :color="plan.discountColor">
                  {{ plan.discount }}% {{ $t('member.discount') }}
                  {{ $t('member.annual') }}
                </a-tag>
              </div>
            </div>

            <div class="pricing" style="text-align:center; margin: 20px 0;">
              <div class="price">{{ currency }} {{ plan.price }}</div>
            </div>

            <div class="credits">
              <div class="credits-amount">
                {{ plan.monthly_points.toLocaleString() }}
                {{ $t('member.points') }} / {{ $t('member.month') }}
              </div>
            </div>

            <div class="cta">
              <a-button
                :loading="loading"
                type="primary"
                size="large"
                :disabled="isMember"
                block
                :class="{ 'popular-btn': plan.popular }"
                @click="pay(plan)"
              >
                {{ isMember ? $t('member.alreadyCurrentMember') : $t('member.select') }}
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
      <div v-else style="text-align: center; margin-top: 40px; font-size: 16px; color: #888;">
        {{ $t('member.noPlanForBilling') }}
      </div>
    </div>

  </div>

  <a-modal v-model:open="showQrCode" :title="$t('member.qrTitle')" centered :footer="null">
    <div style="text-align: center;">
      <div style="display: inline-block;">
        <a-qrcode :value="qrCodeUrl" :size="200" />
      </div>
      <p style="margin-top: 12px;">{{ $t('member.qrTip') }}</p>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount, onMounted,computed } from 'vue'
import membershipService from '@/services/membership'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()



import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/modules/user.js'
const userStore = useUserStore();
const { user, membership, points } = storeToRefs(userStore);

import { message } from 'ant-design-vue'


const billingType = ref('month')
const billingOptions = [
  { label: t('member.billingMonthly'), value: 'month' },
  { label: t('member.billingYearly'), value: 'year' },
]

const pricingPlans = ref([])
const showQrCode = ref(false)
const qrCodeUrl = ref('')
const pollingTimer = ref(null)
const loading = ref(false)

import { useRouter } from 'vue-router'
const router = useRouter()

const back = () => {
  router.push('/')
}


//如果已经是会员 则不能购买
const isMember = computed(() => {
  //membership?.planName 
  return membership.value?.planName
})

onMounted(() => {
  const isClient = import.meta.env.VITE_IS_CLIENT === 'true';
  if(window.electronAPI){
    window.electronAPI.on('stripe-payment-success', ({ orderId,amount,currency,status }) => {
      console.log("stripe-payment-success",orderId,amount,currency,status);
      if(status === 'paid'){
        message.success(t('member.paySuccess'));
        router.push('/');
      }else{
        message.error(t('member.payFailed'));
      }
    });
    //支付取消
    window.electronAPI.on('stripe-payment-cancel', () => {
      message.error(t('member.payCancel'));
    });
  }
})

const filteredPlans = computed(() => {
  console.log('filteredPlans', billingType.value,pricingPlans.value)
  //duration_days 根据这个判断 如果是 365 则为年 否则 则为 月
  return pricingPlans.value.filter(plan => {
    if (billingType.value === 'year') {
      return plan.duration_days === 365
    } else {
      return plan.duration_days !== 365
    }
  })
})

const checkOrderStatus = async (orderSn) => {
  const maxRetries = 20
  let attempts = 0

  pollingTimer.value = setInterval(async () => {
    attempts++
    const res = await membershipService.checkOrderStatus(orderSn)
    if (res?.status === 'paid') {
      clearInterval(pollingTimer.value)
      showQrCode.value = false
      paySuccess()
      console.log(t('member.paySuccess'))
    }
    if (attempts >= maxRetries) {
      clearInterval(pollingTimer.value)
      console.warn(t('member.payTimeout'))
    }
  }, 3000)
}

//判断是国内还是海外 VITE_REGION
const isAbroad = computed(() => import.meta.env.VITE_REGION === 'abroad');

//¥
const currency = computed(() => {
  return isAbroad.value ? '$' : '¥'
})

const pay = async (plan) => {
  loading.value = true
  if (isAbroad.value) {
    //createOrder
    let res = await membershipService.createStripeOrder(plan.id)
    console.log("createStripeOrder",res)
    //url 跳转到 url 不是新页面打开
    window.location.href = res.url; 
    loading.value = false
  }else{
    //createStripeOrder
    let res = await membershipService.createOrder(plan.id)
      if (res && res.code_url) {
        loading.value = false
        qrCodeUrl.value = res.code_url
        showQrCode.value = true
        checkOrderStatus(res.order_sn)
      } else {
        loading.value = false
        console.error(t('member.qrError'), res)
      }
  }
}

const paySuccess = () => {
  router.push('/')
}

const getMembershipPlan = async () => {
  let res = await membershipService.getList()
  pricingPlans.value = res
}

onMounted(() => {
  getMembershipPlan()
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
.top-bar {
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
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
