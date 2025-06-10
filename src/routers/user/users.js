const router = require("koa-router")();
const axios = require("axios");
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN;



//转发请求的函数
async function forwardRequest(ctx,method,path) {
  const url = `${SUB_SERVER_DOMAIN}/api/users/`+path;
  const config = {
    method: method,
    maxBodyLength: Infinity,
    url,
    data: ctx.request.body,
  };

  const result = await axios.request(config);

  console.log("==== result ====",result);
  return result.data;
}

router.post("/google-auth", async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "google-auth")
  return ctx.body = res;
});

router.post("/sendEmailVerifyCode", async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "sendEmailVerifyCode")
  return ctx.body = res;
});

router.post("/verifyEmailVerifyCode", async (ctx) => {
  return ctx.body =  await forwardRequest(ctx, "POST", "verifyEmailVerifyCode")
});

router.post("/register", async (ctx) => {
  return ctx.body =  await forwardRequest(ctx, "POST", "register")
});

//login
router.post("/login", async (ctx) => {
  return ctx.body = await forwardRequest(ctx, "POST", "login")
});

//resetPassword
router.post("/resetPassword", async (ctx) => {
  return ctx.body =  await forwardRequest(ctx, "POST", "resetPassword")
});

router.get('/auth/google', async (ctx) => {
  // 获取 query 参数对象
  const query = ctx.query;

  // 将 query 对象转换为 URL 查询字符串
  const queryString = new URLSearchParams(query).toString();

  // 拼接目标 URL（带上 hash 和查询参数）
  const redirectUrl = `http://localhost:5000/#/auth/google${queryString ? '?' + queryString : ''}`;

  ctx.redirect(redirectUrl);
});



module.exports = exports = router.routes();
