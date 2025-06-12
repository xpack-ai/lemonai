require("module-alias/register");
require("dotenv").config();

const sub_server_request = require('@src/utils/sub_server_request')

const call = require("@src/utils/llm");
const resolvePlanningPrompt = require("@src/agent/prompt/plan");
const { getDefaultModel } = require('@src/utils/default_model')


const planning = async (goal, files, previousResult, conversation_id) => {
  let model_info = await getDefaultModel()
  if (model_info.is_subscribe) {
    let clean_tasks = await planning_server(goal, files, previousResult, conversation_id)
    return clean_tasks
  }

  let clean_tasks = await planning_local(goal, files, previousResult, conversation_id)
  return clean_tasks
};

const planning_server = async (goal, files, previousResult, conversation_id) => {
  return sub_server_request('/api/sub_server/planning', {
    goal,
    files,
    previousResult,
    conversation_id
  })
};

const planning_local = async (goal, files, previousResult, conversation_id) => {
  const planning_prompt = await resolvePlanningPrompt(goal, files, previousResult, conversation_id);
  console.log("\n==== planning prompt ====", planning_prompt);
  const tasks = await call(planning_prompt, conversation_id, 'assistant', {
    response_format: 'json',
    temperature: 0,
  });
  console.log("\n==== planning result ====");
  console.log(tasks);
  const clean_tasks = tasks.filter(item => {
    return item.tools && item.tools.length > 0;
  }) || [];
  return clean_tasks;
};
module.exports = exports = planning;
