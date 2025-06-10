require("module-alias/register");
require("dotenv").config();

const axios = require('axios')
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN;

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
  const url = `${SUB_SERVER_DOMAIN}/api/sub_server/summary`
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url,
    data: {
      goal,
      conversation_id, 
      tasks
    },
  };

  const result = await axios.request(config);
  return result.data.data;
};

const summary_local = async (goal, conversation_id, tasks) => {
  const prompt = await resolveResultPrompt(goal, tasks);
  const result = await call(prompt, conversation_id);

  return result
}

module.exports = exports = summary;
