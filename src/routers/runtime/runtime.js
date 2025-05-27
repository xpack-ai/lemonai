const router = require("koa-router")();

const DockerRuntime = require("@src/runtime/DockerRuntime.js");


/**
 * @swagger
 * /api/runtime/vscode-url:
 *   get:
 *     tags:
 *       - Runtime
 *     summary: Get the VSCode URL for the running container
 *     description: |
 *       This endpoint retrieves the URL for accessing the VSCode instance running in the Docker container.
 *     parameters:
 *       - in: query
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the conversation to retrieve messages for.
 *     responses:
 *       200:
 *         description: Successfully retrieved the VSCode URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL for accessing the VSCode instance
 *                 code:
 *                   type: integer
 *                   description: Status code
 *                 msg:
 *                   type: string
 *                   description: Message
 */
router.get('/vscode-url', async ({ query, response }) => {
    const { conversation_id } = query;
    let dir_name = ''
    if (conversation_id) {
        dir_name = 'Conversation_' + conversation_id.slice(0, 6);
    }

    const runtime = new DockerRuntime()
    const container = await runtime.connect_container()
    const container_info = await container.inspect()

    const vscode_port = Object.keys(container_info.NetworkSettings.Ports)[1].split('/')[0]

    const vscode_url = `http://localhost:${vscode_port}?folder=/workspace/${dir_name}`;
    return response.success({ url: vscode_url });
});

module.exports = exports = router.routes();