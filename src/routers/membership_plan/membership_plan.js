const router = require("koa-router")();
const axios = require("axios");
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN||'https://sub-server.lemonai.cc';



//转发请求的函数
async function forwardRequest(ctx,method,path) {
  const url = `${SUB_SERVER_DOMAIN}/api/membership_plan/`+path;
  const config = {
    method: method,
    maxBodyLength: Infinity,
    url,
    headers: {
      authorization: ctx.headers['authorization'],
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
