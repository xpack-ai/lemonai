require("module-alias/register");
require("dotenv").config();

const axios = require('axios')
const SUB_SERVER_DOMAIN = process.env.SUB_SERVER_DOMAIN;

const call = require("@src/utils/llm");
const { getDefaultModel } = require('@src/utils/default_model')
const resolveGenerateTitlePrompt = require("@src/agent/prompt/generate_title");
const resolveThinking = require("@src/utils/thinking");

const generate_title = async (question, conversation_id) => {
    let model_info = await getDefaultModel()
    if (model_info.is_subscribe) {
        let title = await generate_title_server(question, conversation_id)
        return title
    }
    let replay = await generate_title_local(question, conversation_id)
    return replay
}

const generate_title_server = async (question, conversation_id) => {
    const url = `${SUB_SERVER_DOMAIN}/api/sub_server/generate_title`
    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url,
        data: {
            question,
            conversation_id
        },
    };

    const result = await axios.request(config);
    return result.data.data;
};

const generate_title_local = async (question, conversation_id) => {
    const prompt = await resolveGenerateTitlePrompt(question);
    const content = await call(prompt, conversation_id);
    // handle thinking model result
    if (content && content.startsWith('<think>')) {
        const { thinking: _, content: title } = resolveThinking(content);
        return title;
    }
    return content;
}

module.exports = exports = generate_title;
