const resolveThinkingPrompt = require("./thinking.prompt");

const call = require("@src/utils/llm");
const DEVELOP_MODEL = 'assistant';
console.log('DEVELOP_MODEL', DEVELOP_MODEL);

const thinking = async (requirement, context = {}) => {
  const { memory, retryCount } = context;
  // console.log('memory', memory);
  const summarize = false;
  const messages = await memory.getMessages(summarize);
  if (retryCount > 0) {
    // Retry with user reply
    messages.pop();
  }

  // If last message is assistant, return directly, support quickly playback and run action
  const message = messages[messages.length - 1];
  if (message && message.role === 'assistant') {
    return message.content;
  }

  // Use LLM thinking to instruct next action
  let prompt = '';
  if (messages.length == 0) {
    prompt = await resolveThinkingPrompt(requirement, context);
  }
  const options = {
    messages: messages.map(item => {
      return { role: item.role, content: item.content }
    })
  }
  const content = await call(prompt, context.conversation_id, DEVELOP_MODEL, options);
  // console.log('content', content);
  if (prompt) {
    await memory.addMessage('user', prompt);
  }
  await memory.addMessage('assistant', content);
  return content;
}

module.exports = exports = thinking;