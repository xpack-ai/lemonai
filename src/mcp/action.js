require('module-alias/register');
require('dotenv').config();

const resolveServers = require("@src/mcp/server");

const resolveServer = async (name) => {
  const servers = await resolveServers();
  const server = servers.find(server => server.name === name);
  return server;
}

const mcp_client = require('@src/mcp/client');

const mcpToolActionCall = async (params = {}) => {
  console.log(JSON.stringify(params, null, 2))
  const { name, arguments } = params;
  const args = typeof arguments === 'string' ? JSON.parse(arguments) : arguments;
  const [serverName, toolName] = name.split('__');
  const server = await resolveServer(serverName);
  const options = {
    server: server,
    name: toolName,
    args
  }
  const result = await mcp_client.callTool(options);
  if (typeof result === 'object') {
    return JSON.stringify(result);
  }
  return result;
}

module.exports = mcpToolActionCall

const run = async () => {
  const action = {
    "name": "howtocook-mcp__mcp_howtocook_whatToEat",
    "arguments": "{\"peopleCount\":3}",
    "conversation_id": "06b34bbd-5131-4c83-b6e4-4d25dddcc327"
  }
  const result = await mcpToolActionCall(action);
  console.log(result);
  process.exit(0);
}
// run();