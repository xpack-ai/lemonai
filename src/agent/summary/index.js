require("module-alias/register");
require("dotenv").config();

const sub_server_request = require('@src/utils/sub_server_request')

const call = require("@src/utils/llm");
const { getDefaultModel } = require('@src/utils/default_model')
const resolveResultPrompt = require('@src/agent/prompt/generate_result.js');


const summary = async (goal, conversation_id, tasks) => {
  let model_info = await getDefaultModel()
  if (model_info.is_subscribe) {
    let replay = await summary_server(goal, conversation_id, tasks)
    return replay
  }
  let replay = await summary_local(goal, conversation_id, tasks)
  return replay
}

const summary_server = async (goal, conversation_id, tasks) => {
  return sub_server_request('/api/sub_server/summary', {
    goal,
    conversation_id,
    tasks
  })
};

const summary_local = async (goal, conversation_id, tasks) => {
  const prompt = await resolveResultPrompt(goal, tasks);
  const result = await call(prompt, conversation_id);

  return result
}

module.exports = exports = summary;
