const { resolveTemplate, loadTemplate } = require("@src/utils/template");

const describeUploadFiles = files => {
  let content = ''
  for (let file of files) {
    content += 'upload/' + file.name + "\n"
  }
  return content;
}

const resolvePlanningPrompt = async (goal, files = [], previousResult = '') => {

  const promptTemplate = await loadTemplate('planning.txt');
  const system = `Current Time: ${new Date().toLocaleString()}`
  const uploadFileDescription = describeUploadFiles(files);
  const prompt = resolveTemplate(promptTemplate, {
    goal,
    files: uploadFileDescription,
    previous: previousResult,
    system,
  })
  return prompt;
}

module.exports = exports = resolvePlanningPrompt;