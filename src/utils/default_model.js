require("module-alias/register");
const DefaultModelSetting = require('@src/models/DefaultModelSetting');
const Model = require('@src/models/Model');
const Plantform = require('@src/models/Platform');
const globals = require('@src/globals');
const sub_server_request = require('@src/utils/sub_server_request')

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
    // todo 获取线上browser模型
    const browser_model_name = await getSubServerBrowserModel()
    return { model_name: browser_model_name, platform_name, api_key: token, api_url: `${process.env.SUB_SERVER_DOMAIN || 'https://sub-server.lemonai.cc'}/api/agent/v1/chat/completions`, base_url: `${process.env.SUB_SERVER_DOMAIN || 'https://sub-server.lemonai.cc'}/api/agent/v1`, is_subscribe: platform.dataValues.is_subscribe, model_id: model.dataValues.id };
  }

  return { model_name, platform_name, api_key, api_url, base_url: base_url, is_subscribe: platform.dataValues.is_subscribe, model_id: model.dataValues.id };
};

const getDefaultModel = async (type = 'assistant') => {
  // For subscribed models, always fetch fresh data
  const modelInfo = await _fetchDefaultModel(type);
  if (modelInfo && !modelInfo.is_subscribe) {
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

const getSubServerBrowserModel = async () => {
  return sub_server_request('/api/sub_server/get_browser_model', {})
}

module.exports = {
  getDefaultModel,
  updateDefaultModel,
};