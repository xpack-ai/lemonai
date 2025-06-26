const mcpToolCall = require('./action');

const mcp_tool = {
  name: "mcp_tool",
  description: "mcp_tool: provides a set of methods to accomplish specific task",
  params: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "tool name"
      },
      arguments: {
        type: "object",
        description: "tool arguments"
      }
    }
  },
  memorized: true,
  getActionDescription({ name, arguments }) {
    return `mcp 工具调用: ${name} ${JSON.stringify(arguments)}`;
  },
  async execute(action, uuid) {
    const result = await mcpToolCall(action);
    // return result;
    return {
      uuid,
      status: 'success',
      content: result,
      meta: {
        action_type: action.type,
      }
    };
  }
}

module.exports = mcp_tool;