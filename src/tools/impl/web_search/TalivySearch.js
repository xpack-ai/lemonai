const axios = require('axios');
// const { resolveAxiosInstance } = require('@utils/network');
const HOST = 'https://api.tavily.com/search';

class TalivySearch {
  constructor({ key: API_KEY }) {
    this.API_KEY = API_KEY;
    this.baseUrl = HOST;
  }

  async search(query, options = {}) {
    const defaultOptions = {
      topic: 'general',
      search_depth: 'basic',
      max_results: 1,
      include_raw_content: true,
      include_images: false,
      include_image_descriptions: false,
      include_domains: [],
      exclude_domains: []
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      query
    };

    try {
      // @ts-ignore
      const response = await axios.post(this.baseUrl, requestOptions, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      this.result = response.data
      return this.result;
    } catch (error) {
      console.error('TalivySearch error:', error);
      throw error;
    }
  }

  async formatContent() {
    const { query, num_results, results = [] } = this.result;
    const list = []
    for (const item of results) {
      const description = `URL: ${item.url}\nTitle: ${item.title}\nContent: ${item.content}\n`;
      list.push(description);
    }
    return list.join('======\n======');
  }

  async formatJSON() {
    const { results = [] } = this.result;
    return results;
  }
}

module.exports = TalivySearch;