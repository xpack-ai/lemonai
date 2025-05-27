const WebSearch = {
  name: "web_search", // Snake_case is common for LLM function names
  description: `Use this tool to search the web for information`,
  params: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "the search key words split with space",
      },
      num_results: {
        type: "integer",
        description: "Optional. The desired number of search results (default: 3).",
      }
    },
    required: ["query"], // Only 'query' is mandatory
  },
};

module.exports = WebSearch;