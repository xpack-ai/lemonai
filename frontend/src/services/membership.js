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
  //create_point_purchase_order
  async createPointPurchaseOrder(product_id) {
    const uri = '/api/payment/create_point_purchase_order'
    const res = await http.post(uri, {
      product_id: product_id
    })
    return res
  },

  ///strip/create_point_purchase_order
  async createStripeOrder(planId) {
    const uri = '/api/payment/strip/create_mambership_plan_order'
    const res = await http.post(uri, {
      membership_plan_id:planId
    })
    return res
  },
  //stripe/create_point_purchase_order
  async createStripePointPurchaseOrder(product_id) {
    const uri = '/api/payment/strip/create_point_purchase_order'
    const res = await http.post(uri, {
      product_id: product_id
    })
    return res
  },
  ///strip/checkout-session
  async createStripeCheckoutSession(sessionId) {
    const uri = '/api/payment/strip/checkout-session'
    const res = await http.get(uri, {
      session_id: sessionId
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
  //check_order_status_by_id
  async checkOrderStatusById(orderId) {
    const uri = '/api/payment/check_order_status_by_id'
    const res = await http.get(uri, {
      order_id: orderId
    })
    return res
  },
  //points_transaction
  async getPointsTransactionList(Query) {
    const uri = '/api/points_transaction/list'
    const res = await http.get(uri,Query)
    return res
  },
  //order list
  async getOrderList(Query) {
    const uri = '/api/order/list'
    const res = await http.get(uri,Query)
    return res
  },
  //recharge_product/list
  async getRechargeProductList() {
    const uri = '/api/recharge_product/list'
    const res = await http.get(uri)
    return res
  },
}

export default service