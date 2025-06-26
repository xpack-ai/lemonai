const resolveToolPrompt = require('@src/agent/prompt/tool');

// 提示词转换函数
const { describeLocalMemory, loadConversationMemory, describeUploadFiles, describeSystem } = require("./thinking.util");

const resolveServers = require("@src/mcp/server.js");
const { resolveMcpServerPrompt } = require("@src/mcp/prompt.js");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 模板加载解析
const { resolveTemplate, loadTemplate } = require("@src/utils/template");

const resolveThinkingPrompt = async (requirement = '', context = {}) => {

  const { reflection = '', goal = '' } = context;
  const memory = await describeLocalMemory(context);
  const tools = await resolveToolPrompt(); // system tools
  const servers = await resolveServers(context);
  const mcpToolsPrompt = await resolveMcpServerPrompt(servers); // mcp server tools
  // console.log("mcpToolsPrompt", mcpToolsPrompt);
  const uploadFileDescription = describeUploadFiles(context.files || []);
  const previousResult = await loadConversationMemory(context.conversation_id);
  const app_ports = JSON.stringify([context.runtime.app_port_1, context.runtime.app_port_2])
  const system = describeSystem();

  const promptTemplate = await loadTemplate('thinking.txt');
  const thinking_prompt = await resolveTemplate(promptTemplate, {
    system, // 系统信息
    app_ports, // 端口信息
    previous: previousResult, // 前置记录结果
    memory, // 执行记录
    files: uploadFileDescription, // 上传文件信息
    goal, // 主任务目标
    requirement, // 当前需求
    reflection, // 反馈信息
    tools: tools + '\n' + mcpToolsPrompt // 工具列表
  })

  // console.log('thinking_prompt', thinking_prompt);
  // await delay(200);
  // process.exit(0);
  return thinking_prompt;
}

module.exports = resolveThinkingPrompt;