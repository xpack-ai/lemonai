require("module-alias/register");
require("dotenv").config();

const axios = require('axios')

const call = require("@src/utils/llm");
const { getDefaultModel } = require('@src/utils/default_model')
const resolveAutoReplyPrompt = require('@src/agent/prompt/auto_reply.js');

const auto_reply = async (goal, conversation_id) => {
  let model_info = await getDefaultModel()
  if (model_info.is_subscribe) {
    let replay = await auto_reply_server(goal)
    return replay
  }
  let replay = await auto_reply_local(goal, conversation_id)
  return replay
}

const auto_reply_server = async (goal) => {
  const url = ''
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url,
    data: {
      goal
    },
  };

  const result = await axios.request(config);
  return result.data.data;
};

const auto_reply_local = async (goal, conversation_id) => {
  // Call the model to get a response in English based on the goal
  const prompt = await resolveAutoReplyPrompt(goal);
  const auto_reply = await call(prompt, conversation_id);

  return auto_reply
}

module.exports = exports = auto_reply;
