import http from "@/utils/http.js";

const service = {
  connect(server){
    const uri = `/api/mcp_server/connect`;
    return http.post(uri, server);
  }
};

export default service;