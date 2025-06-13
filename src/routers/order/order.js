const router = require("koa-router")();
const axios = require("axios");
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN;



//转发请求的函数
async function forwardRequest(ctx, method, path) {
  const url = `${SUB_SERVER_DOMAIN}/api/order/${path}`;
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

router.get("/list",async (ctx) => {
  let res =  await forwardRequest(ctx, "GET", "list")
  return ctx.body = res;
})


module.exports = exports = router.routes();
