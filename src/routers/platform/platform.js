const router = require("koa-router")();

const Platform = require("@src/models/Platform");
const Model = require("@src/models/Model");

// Create a new platform
/**
 * @swagger
 * /api/platform:
 *   post:
 *     summary: Create a new platform
 *     tags:  
 *       - Platform
 *     description: This endpoint creates a new platform with the provided content.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Platform name
 *               logo_url:
 *                 type: string
 *                 description: Logo URL
 *               source_type:
 *                 type: string
 *                 description: Source type
 * 
 *     responses:
 *       200:
 *         description: Successfully created a new platform
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: './schemas/platform.json'
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 *                 
 */
router.post("/", async ({ request, response }) => {
  const body = request.body || {};

  const { name, logo_url, source_type } = body

  const platform = await Platform.create({
    name: name,
    logo_url: logo_url,
    source_type: source_type,
  });

  return response.success(platform);
});

// Get platform list
/**
 * @swagger
 * /api/platform:
 *   get:
 *     summary: Get platform list
 *     tags:  
 *       - Platform
 *     description: This endpoint retrieves the list of platforms.
 *     responses:
 *       200:
 *         description: Successfully retrieved the platform list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: './schemas/platform.json'
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 */
router.get("/", async ({ response }) => {
  const platforms = await Platform.findAll({ order: [['create_at', 'DESC']] });
  return response.success(platforms);
});

// update platform
/**
 * @swagger
 * /api/platform/{platform_id}:
 *   put:
 *     summary: Update platform
 *     tags:  
 *       - Platform
 *     description: This endpoint updates the platform with the provided platform_id.
 *     parameters:
 *       - name: platform_id
 *         in: path
 *         required: true
 *         description: Unique identifier for the platform
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: Platform api key
 *               api_url:
 *                 type: string
 *                 description: Platform api url
 *               name:
 *                 type: string
 *                 description: Platform name
 *               is_enabled:
 *                 type: boolean
 *                 description: Is platform enabled
 *
 *
 */
router.put("/:platform_id", async ({ params, request, response }) => {
  const { platform_id } = params;
  const body = request.body || {};

  const { api_key, api_url, name, is_enabled } = body

  const platform = await Platform.findOne({
    where: { id: platform_id }
  });
  if (!platform) {
    return response.fail({}, "Platform does not exist");
  }

  await platform.update({
    name: name,
    api_key: api_key,
    api_url: api_url,
    is_enabled: is_enabled
  });

  return response.success(platform);
});

// delete platform
/**
 * @swagger
 * /api/platform/{platform_id}:
 *   delete:
 *     summary: Delete platform
 *     tags:  
 *       - Platform
 *     description: This endpoint deletes the platform with the provided platform_id.
 *     parameters:
 *       - name: platform_id
 *         in: path
 *         required: true
 *         description: Unique identifier for the platform
 *         schema:
 *           type: string
 */
router.delete("/:platform_id", async ({ params, response }) => {
  const { platform_id } = params;

  const platform = await Platform.findOne({
    where: { id: platform_id }
  });
  if (!platform) {
    return response.fail({}, "Platform does not exist");
  }

  if (platform.source_type === "system") {
    return response.fail({}, "system platform cannot be deleted");
  }

  await platform.destroy();

  await Model.destroy({
    where: { platform_id: platform_id }
  });

  return response.success();
});

module.exports = exports = router.routes();