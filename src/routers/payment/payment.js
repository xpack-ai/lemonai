const router = require("koa-router")();
const axios = require("axios");
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN || 'https://sub-server.lemonai.cc';



//转发请求的函数
async function forwardRequest(ctx, method, path) {
  const url = `${SUB_SERVER_DOMAIN}/api/payment/${path}`;
  const config = {
    method,
    maxBodyLength: Infinity,
    url,
    headers: {
      authorization: ctx.headers['authorization'],
    },
  };

  if (method.toUpperCase() === 'GET') {
    config.params = ctx.query; // GET 请求通过 query 传参
  } else {
    config.data = ctx.request.body; // POST、PUT 等通过 body 传参
  }

  const result = await axios.request(config);
  return result.data;
}

router.post("/create_mambership_plan_order", async (ctx) => {
  let res = await forwardRequest(ctx, "POST", "create_mambership_plan_order")
  return ctx.body = res;
})

//create_point_purchase_order
router.post("/create_point_purchase_order", async (ctx) => {
  let res = await forwardRequest(ctx, "POST", "create_point_purchase_order")
  return ctx.body = res;
})

router.get("/check_order_status", async (ctx) => {
  let res = await forwardRequest(ctx, "GET", "check_order_status")
  return ctx.body = res;
})

//check_order_status_by_id
router.get("/check_order_status_by_id", async (ctx) => {
  let res = await forwardRequest(ctx, "GET", "check_order_status_by_id")
  return ctx.body = res;
})


// /strip/create_mambership_plan_order
router.post("/strip/create_mambership_plan_order",async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "strip/create_mambership_plan_order")
  return ctx.body = res;
})
// /strip/create_point_purchase_order
router.post("/strip/create_point_purchase_order",async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "strip/create_point_purchase_order")
  return ctx.body = res;
})
// payment/strip/checkout-session
router.get("/strip/checkout-session",async (ctx) => {
  let res =  await forwardRequest(ctx, "GET", "strip/checkout-session")
  return ctx.body = res;
})

module.exports = exports = router.routes();
