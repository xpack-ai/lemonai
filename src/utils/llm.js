const { getDefaultModel } = require('@src/utils/default_model')

const createLLMInstance = require("@src/completion/llm.one.js");
const parseJSON = require("./json.js");

const calcToken = require('@src/completion/calc.token.js')
const Conversation = require('@src/models/Conversation.js')

const defaultOnTokenStream = (ch) => {
  process.stdout.write(ch);
}

const DEFAULT_MODEL_TYPE = "assistant";

const LLM_LOGS = require('@src/models/LLMLogs.js');

/**
 * @param {*} prompt 
 * @param {*} model_type 
 * @param {*} options 
 * @param {*} onTokenStream 
 * @returns {Promise<string>}
 */
const call = async (prompt, conversation_id, model_type = DEFAULT_MODEL_TYPE, options = { temperature: 0 }, onTokenStream = defaultOnTokenStream) => {
  const model_info = await getDefaultModel(model_type)
  const model = `provider#${model_info.platform_name}#${model_info.model_name}`;
  const llm = await createLLMInstance(model, onTokenStream, { model_info });
  const { response_format, messages = [], ...restOptions } = options;
  const context = { messages };
  const content = await llm.completion(prompt, context, restOptions);
  const inputPrompt = messages.map(item => item.content).join('\n') + '\n' + prompt;
  const input_tokens = calcToken(inputPrompt)
  const output_tokens = calcToken(content)
  if (conversation_id) {
    const conversation = await Conversation.findOne({ where: { conversation_id: conversation_id } })
    if (conversation) {
      conversation.input_tokens = conversation.input_tokens + input_tokens
      conversation.output_tokens = conversation.output_tokens + output_tokens
      await conversation.save()
    }
  }
  if (response_format === 'json') {
    const json = parseJSON(content);
    // @ts-ignore
    await LLM_LOGS.create({ model, prompt, messages, content, json });
    return json;
  }
  // @ts-ignore
  await LLM_LOGS.create({ model, prompt, messages, content });
  return content;
}

module.exports = exports = call;
