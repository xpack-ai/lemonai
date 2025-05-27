const Router = require("koa-router");
const router = new Router();

const Experience = require("@src/models/Experience");

/**
 * @swagger
 * /api/experience/list:
 *   get:
 *     summary: Get experiences list
 *     tags:  
 *       - Experience
 *     description: List of experiences.
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: experience type
 *     responses:
 *       200:
 *         description: A list of experiences.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: './schemas/experience.json'
 */
router.get("/list", async (ctx) => {
    const { type } = ctx.query;
    const where = {};
    if (type) where["type"] = type;
    let experiences;
    try {
        experiences = await Experience.findAll({ where });
    } catch (e) {
        return ctx.response.fail(e.message || "Database error");
    }
    return ctx.response.success(experiences);
});

/**
 * @swagger
 * /api/experience:
 *   post:
 *     summary: Create a new experience
 *     tags:
 *       - Experience
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               goal:
 *                 type: string
 *               content:
 *                 type: string
 *               is_enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Experience created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: './schemas/experience.json'
 *                 code:
 *                   type: integer
 *                 msg:
 *                   type: string
 */
router.post("/", async (ctx) => {
    const { type, title, goal, content, is_enabled } = ctx.request.body || {};
    if (!type || !title) {
        return ctx.response.fail("Missing required fields: type or title");
    }
    let experience;
    try {
        experience = await Experience.create({
            type,
            title,
            goal,
            content,
            is_enabled: is_enabled ?? false,
        });
    } catch (e) {
        return ctx.response.fail(e.message || "Database error");
    }
    return ctx.response.success(experience);
});

/**
 * @swagger
 * /api/experience:
 *   put:
 *     summary: Update an experience
 *     tags:
 *       - Experience
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Experience ID
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               goal:
 *                 type: string
 *               content:
 *                 type: string
 *               is_enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Experience updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: './schemas/experience.json'
 *                 code:
 *                   type: integer
 *                 msg:
 *                   type: string
 */
router.put("/", async (ctx) => {
    const { id, type, title, goal, content, is_enabled } = ctx.request.body || {};
    if (!id) {
        return ctx.response.error("Missing id");
    }
    let experience;
    try {
        experience = await Experience.findByPk(id);
    } catch (e) {
        return ctx.response.error(e.message || "Database error");
    }
    if (!experience) {
        return ctx.response.error("Experience not found");
    }
    // Only update fields if provided
    const updateFields = {};
    if (type !== undefined) updateFields.type = type;
    if (title !== undefined) updateFields.title = title;
    if (goal !== undefined) updateFields.goal = goal;
    if (content !== undefined) updateFields.content = content;
    if (is_enabled !== undefined) updateFields.is_enabled = is_enabled;
    try {
        await experience.update(updateFields);
    } catch (e) {
        return ctx.response.error(e.message || "Update failed");
    }
    return ctx.response.success(experience);
});

/**
 * @swagger
 * /api/experience:
 *   delete:
 *     summary: Delete an experience
 *     tags:
 *       - Experience
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Experience ID
 *     responses:
 *       200:
 *         description: Experience deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 msg:
 *                   type: string
 */
router.delete("/", async (ctx) => {
    const { id } = ctx.query;
    if (!id) {
        return ctx.response.error("Missing id");
    }
    let experience;
    try {
        experience = await Experience.findByPk(id);
    } catch (e) {
        return ctx.response.error(e.message || "Database error");
    }
    if (!experience) {
        return ctx.response.error("Experience not found");
    }
    try {
        await experience.destroy();
    } catch (e) {
        return ctx.response.error(e.message || "Delete failed");
    }
    return ctx.response.success(true);
});

module.exports = exports = router.routes();