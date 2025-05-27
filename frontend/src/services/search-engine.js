import http from "@/utils/http";


const service = {
    async getSearchEngineConfig() {
        const url = "/api/search_provider_setting"
        const response = await http.get(url)
        return response || {}
    },
    async getSearchEngineTemplates() {
        const url = "/api/search_provider_setting/templates"
        const response = await http.get(url)
        return response || {} 
    },
    async getSearchEngineConfigs() {
        const url = "/api/search_provider_setting/configs"
        const response = await http.get(url)
        return response || {} 
    },
    async updateSearchEngineConfig(config) {
        const url = "/api/search_provider_setting/"
        const response = await http.put(url, config)
        return response.data || {}
    }
}

export default service;



