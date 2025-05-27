require("module-alias/register");
require("dotenv").config();

const call = require("@src/utils/llm");
const resolvePlanningPrompt = require("@src/agent/prompt/plan");

const planning = async (goal, files, previousResult, conversation_id) => {
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
