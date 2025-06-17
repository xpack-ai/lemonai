const axios = require('axios')

async function browser(action, uuid) {
  const host = 'localhost'
  const host_port = 9000
  // Tips:Some times some models may need to use the question parameter instead of params.question,Such as Deepseek-V3,Qwen.
  let question = action.params.question;
  if (question === "" || question === undefined) {
    question = action.params.params.question;
  }

  const request = {
    method: 'POST',
    url: `http://${host}:${host_port}/api/browser/task`,
    data: { prompt: question, llm_config: action.params.llm_config, conversation_id: action.params.conversation_id },
  };

  const response = await axios(request);
  // const result_content = response.data.data.history.task;
  const result_content = JSON.stringify(response.data.data.history.browser_history);
  return {
    uuid,
    status: 'success',
    content: result_content,
    meta: {
      action_type: 'browser',
      json: { browser_history: response.data.data.history.browser_history, browser_history_screenshot: response.data.data.history.browser_history_screenshot }
    }
  };
}


module.exports = browser;