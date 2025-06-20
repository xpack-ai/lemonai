const resolveToolPrompt = require('@src/agent/prompt/tool');

// 提示词转换函数
const { describeLocalMemory, loadConversationMemory, describeUploadFiles, describeSystem } = require("./thinking.util");

// 模板加载解析
const { resolveTemplate, loadTemplate } = require("@src/utils/template");

const resolveThinkingPrompt = async (requirement = '', context = {}) => {

  const { reflection = '', goal = '' } = context;
  const memory = await describeLocalMemory(context);
  const tools = await resolveToolPrompt();
  const uploadFileDescription = describeUploadFiles(context.files || []);
  const previousResult = await loadConversationMemory(context.conversation_id);
  const app_ports = JSON.stringify([context.runtime.app_port_1, context.runtime.app_port_2])
  const system = describeSystem();

  const promptTemplate = await loadTemplate('thinking.txt');
  const thinking_prompt = resolveTemplate(promptTemplate, {
    system, // 系统信息
    app_ports, // 端口信息
    previous: previousResult, // 前置记录结果
    memory, // 执行记录
    files: uploadFileDescription, // 上传文件信息
    goal, // 主任务目标
    requirement, // 当前需求
    reflection, // 反馈信息
    tools // 工具列表
  })
  return thinking_prompt;
}

module.exports = resolveThinkingPrompt;