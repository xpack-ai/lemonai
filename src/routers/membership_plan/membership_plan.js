const router = require("koa-router")();
const axios = require("axios");
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN;



//转发请求的函数
async function forwardRequest(ctx,method,path) {
  const url = `${SUB_SERVER_DOMAIN}/api/membership_plan/`+path;
  const config = {
    method: method,
    maxBodyLength: Infinity,
    url,
    headers: {
      ...ctx.headers, // 带上原始请求的 headers
    },
    data: ctx.request.body,
  };

  const result = await axios.request(config);
  return result.data;
}

router.get("/list",async (ctx) => {
  let res =  await forwardRequest(ctx, "GET", "list")
  return ctx.body = res;
})


module.exports = exports = router.routes();
