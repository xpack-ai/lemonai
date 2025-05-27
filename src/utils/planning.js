const call = require('@src/utils/llm.js');
const resolveTodoPrompt = require('@src/agent/prompt/generate_todo.js');

const getTodoMd = async (taskData) => {
  const markdownOutput = convertArrayToMarkdownTodo(taskData);
  return markdownOutput

  // const prompt = resolveTodoPrompt(JSON.stringify(taskData));
  // return await call(prompt)
}

function convertArrayToMarkdownTodo(data) {
  let markdown = "## TODO List\n";
  data.forEach(item => {
    // 假设 "pending" 状态对应未勾选，其他状态（如果存在）可以按需求处理
    const checkbox = item.status === "pending" ? "[ ]" : "[x]"; 
    markdown += `- ${checkbox} ${item.title}: ${item.description}\n`;
  });
  return markdown;
}

module.exports = exports = {
    getTodoMd
}