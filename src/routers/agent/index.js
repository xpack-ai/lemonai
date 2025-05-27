// @ts-ignore
const router = require("koa-router")();

router.prefix("/api/agent");

router.use(require('./run.js'));

module.exports = router.routes();
