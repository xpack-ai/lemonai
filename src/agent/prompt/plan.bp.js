const { resolveTemplate, loadTemplate } = require("@src/utils/template");
const call = require("@src/utils/llm");

const Experience = require('@src/models/Experience')

const USE_EXPERIENCE = process.env.USE_EXPERIENCE || 'TRUE';


const describeUploadFiles = files => {
  let content = ''
  for (let file of files) {
    content += 'upload/' + file.name + "\n"
  }
  return content;
}

const getExperience = async (goal, conversation_id) => {
  const experiences = await Experience.findAll({ where: { is_enabled: true } })
  let list = experiences.map(item => {
    return {
      id: item.dataValues.id,
      title: item.dataValues.title,
      goal: item.dataValues.goal
    }
  })

  const prompt = `You are a semantic similarity analyzer. Your core task is to accurately identify the single most semantically similar historical goal from the provided list of goal_examples based on the given target_goal.

Here is the current target_goal you need to evaluate:
${goal}

And here are the goal_examples (a JSON array of objects, where each object has an id and a goal field) from which you must find the closest match:
${JSON.stringify(list)}

Processing Logic: 1. Understand Goal Semantics: Thoroughly analyze and deeply understand the semantic meaning, intent, and core requirements of the target_goal. 2. Semantic Similarity Comparison: Perform a precise semantic similarity comparison between the target_goal's meaning and the goal field of each historical goal object within the goal_examples array. 3. Select Closest Match: Identify the single historical goal object that is most semantically similar (or closest) to the target_goal. 4. Single Result Principle: Even if multiple historical goals appear very similar, you must select and return only one historical goal's id that you determine to be the absolute closest.

Output Requirements: You must and shall return only one JSON object. This JSON object must contain only the id field of the closest goal-example found. Strictly do not return any additional text, explanations, preambles, postscripts, or formatting (other than the JSON object itself).

Output Format Example: {"id": "id_of_the_closest_goal_example"}
  `

  const res = await call(prompt, conversation_id, 'assistant', {
    response_format: 'json',
    temperature: 0,
  });

  const obj = res;
  let ex = await Experience.findOne({ where: { id: obj.id } })
  return ex.dataValues
}


const resolveExperiencePrompt = async (goal, conversation_id) => {

  if (USE_EXPERIENCE === 'FALSE') {
    return ''
  }

  let experience = await getExperience(goal, conversation_id)
  const experience_goal = experience.goal
  const experience_todo = experience.content
  if (!experience_goal) {
    return ''
  }
  
  return `--- Planning Detail Reference (Content Only, Format Unaffected) ---
As a task planning expert, when generating the task plan, please refer to the following checklist for guidance on breaking down high-level tasks into smaller, more specific, and atomic actionable sub-tasks. Each bullet point in this example represents a distinct and actionable step. **请注意：此示例中的 '- [ ]' 前缀仅用于演示清单格式，在最终结构化 JSON 输出中的单个任务的 'content' 或 'description' 字段中，不应包含这些前缀。** This example serves to inform the quality and granularity of your planning, not the output format. Your final output MUST strictly adhere to the JSON format described above.
Reference Goal Example: ${experience_goal}

Example Planning Content (for Quality Reference):

${experience_todo}
---`
}

const resolvePlanningPrompt = async (goal, files = [], previousResult = '', conversation_id) => {

  const promptTemplate = await loadTemplate('planning.txt');
  const system = `Current Time: ${new Date().toLocaleString()}`
  const uploadFileDescription = describeUploadFiles(files);
  const experiencePrompt = await resolveExperiencePrompt(goal, conversation_id)
  const prompt = resolveTemplate(promptTemplate, {
    goal,
    files: uploadFileDescription,
    previous: previousResult,
    system,
    experiencePrompt,
  })
  return prompt;
}

module.exports = exports = resolvePlanningPrompt;