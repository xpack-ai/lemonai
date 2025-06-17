const router = require("koa-router")();
const axios = require("axios");
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN || 'https://sub-server.lemonai.cc';



//转发请求的函数
async function forwardRequest(ctx,method,path) {
  const url = `${SUB_SERVER_DOMAIN}/api/users/`+path;
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

  // console.log("==== result ====",result);
  return result.data;
}

router.get("/userinfo",async (ctx) => {
  let res =  await forwardRequest(ctx, "GET", "userinfo")
  return ctx.body = res;
})

router.post("/google-auth", async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "google-auth")
  return ctx.body = res;
});



//loginSMSCode
router.post("/login-sms-code", async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "login-sms-code")
  return ctx.body = res;
});

//send-sms-code
router.post("/send-sms-code", async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "send-sms-code")
  return ctx.body = res;
});
//verifySmsVerifyCode
router.post("/verifySmsVerifyCode", async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "verifySmsVerifyCode")
  return ctx.body = res;
});
///api/users/updateUsername
router.post("/updateUsername", async (ctx) => {
  let res =  await forwardRequest(ctx, "POST", "updateUsername")
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
  const query = ctx.query;
  const queryString = new URLSearchParams(query).toString();

  // 读取环境变量，判断是不是客户端
  // 注意：这里服务端要能读取 import.meta.env 需要相应配置，或者通过 process.env 传递
  // 如果你用的是 Vite + SSR，可能要从 ctx.env 或者其他地方拿
  // 这里假设你用 process.env.VITE_IS_CLIENT 替代
  const isClient = process.env.VITE_IS_CLIENT === 'true';
  console.log("isClient === ",isClient);
  if (isClient) {
    // 是客户端，返回 HTML 页面
    const clientRedirectUrl = `http://localhost:51789/?${queryString}`;

    ctx.set('Content-Type', 'text/html; charset=utf-8');
    ctx.body = `
      <html>
        <head><title>登录成功</title></head>
        <body>
          <h2>登录成功，正在通知客户端，请稍候...</h2>
          <script>
            fetch("${clientRedirectUrl}", {
              method: "GET",
              mode: "no-cors"
            }).catch(() => {});
          </script>
        </body>
      </html>
    `;
  } else {
    // 不是客户端，直接重定向到前端页面
    const redirectUrl = `http://localhost:5005/#/auth/google${queryString ? '?' + queryString : ''}`;
    ctx.redirect(redirectUrl);
  }
});




module.exports = exports = router.routes();
