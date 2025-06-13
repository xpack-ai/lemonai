// @ts-ignore
const router = require("koa-router")();

// 默认首页
router.get("/", async ({ response, request, redis }) => {
  response.body = "Hello, World !";
  response.status = 200;
});

const modules = [
  "agent",
  'conversation',
  'file',
  'platform',
  'model',
  'default_model_setting',
  'search_provider_setting',
  'runtime',
  'message',
  'experience',
  'user',
  'membership_plan',
  'payment',
  'points_transaction',
  'recharge_product',
  'version',
  'order'
];

for (const module of modules) {
  try {
    // console.log('module', module);
    router.use(require(`./${module}/index.js`));
  } catch (error) {
    console.log(`load ${module} error`, error);
  }
}

module.exports = exports = router.routes();
