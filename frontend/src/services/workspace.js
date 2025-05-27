import http from '@/utils/http.js'

const service = {
  // 获取vscode地址
  async getVsCodeUrl(conversationId) {
    const uri = `/api/runtime/vscode-url`
    const response = await http.get(uri,  { conversation_id: conversationId })
    return response || {};
  },

  // 获取文件列表
  async getFiles(conversationId,path){
    const baseUrl = `/api/conversations/${conversationId}/list-files`;
    const url = path ? `${baseUrl}?path=${encodeURIComponent(path)}` : baseUrl;
    const response = await http.get(url);
    return response.data || [];
  },

   // 获取文件内容
   async getFile(path) {
    const baseUrl = `/api/file/read`;
    const response = await http.post(baseUrl, {
      path: path
    });
    // Check if response.data is a string; if so, return it, otherwise convert to string
    return response.data|| '';
  }

}




export default service