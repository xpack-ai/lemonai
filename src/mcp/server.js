const path = require('path');
const fs = require('fs');

const filepath = path.resolve(__dirname, '../../mcp-local.json');
const exists = fs.existsSync(filepath);

// TODO: Config && Load MCP Server from database

const resolveServers = async () => {
  if (exists) {
    const list = require(filepath);
    // 返回开启使用的 mcp servers
    return list.filter(item => item.enable);
  }
  return [];
}

module.exports = exports = resolveServers;