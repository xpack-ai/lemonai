require("module-alias/register");
const DefaultModelSetting = require('@src/models/DefaultModelSetting');
const Model = require('@src/models/Model');
const Plantform = require('@src/models/Platform');
const globals = require('@src/globals');

const _defaultModelCache = {};

const _fetchDefaultModel = async (type = 'assistant') => {
  const defaultModelSetting = await DefaultModelSetting.findOne({ where: { setting_type: type } });
  if (!defaultModelSetting) return null;
  const model = await Model.findOne({ where: { id: defaultModelSetting.dataValues.model_id } });
  if (!model) return null;
  const model_name = model.dataValues.model_id;
  const platform = await Plantform.findOne({ where: { id: model.dataValues.platform_id } });
  if (!platform) return null;

  const api_key = platform.dataValues.api_key;
  const base_url = platform.dataValues.api_url
  let api_url = platform.dataValues.api_url;
  if (type === 'assistant') {
    api_url = platform.dataValues.api_url + '/chat/completions';
  }
  const platform_name = platform.dataValues.name;

  if (platform.dataValues.is_subscribe) {
    const token = globals.getToken()
    return { model_name:'deepseek-chat', platform_name, api_key: token, api_url: `${process.env.SUB_SERVER_DOMAIN}/api/agent/v1/chat/completions`, base_url: `${process.env.SUB_SERVER_DOMAIN}/api/agent/v1`, is_subscribe: platform.dataValues.is_subscribe };
  }

  return { model_name, platform_name, api_key, api_url, base_url: base_url, is_subscribe: platform.dataValues.is_subscribe };
};

const getDefaultModel = async (type = 'assistant') => {
  if (_defaultModelCache[type]) {
    return _defaultModelCache[type];
  }
  const modelInfo = await _fetchDefaultModel(type);
  if (modelInfo) {
    _defaultModelCache[type] = modelInfo;
  }
  return modelInfo;
};

const updateDefaultModel = async (type = 'assistant') => {
  const modelInfo = await _fetchDefaultModel(type);
  if (modelInfo) {
    _defaultModelCache[type] = modelInfo;
  }
  return modelInfo;
};

module.exports = {
  getDefaultModel,
  updateDefaultModel,
};