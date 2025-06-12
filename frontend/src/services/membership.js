import http from '@/utils/http.js'

const service = {
  async getList() {
    const uri = '/api/membership_plan/list'
    const res = await http.get(uri)
    return res
  },

  ///api/payment/create_mambership_plan_order
  async createOrder(planId) {
    const uri = '/api/payment/create_mambership_plan_order'
    const res = await http.post(uri, {
      membership_plan_id: planId
    })
    return res
  },
  ////check_order_status?order_sn
  async checkOrderStatus(orderSn) {
    const uri = '/api/payment/check_order_status'
    const res = await http.get(uri, {
      order_sn: orderSn
    })
    return res
  },
}

export default service