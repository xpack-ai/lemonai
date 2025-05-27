import http from "@/utils/http.js";

const service = {

  ///api/file/upload
  async uploadFile(formData) {
    const uri = `/api/file/upload`;
    return http.post(uri, formData);
  },
  ///api/file put
  async putFile(id,conversation_id){
    const uri = `/api/file`;
    return http.put(uri,{
      id:id,
      conversation_id:conversation_id
    });
  },
  // delete
  async deleteFile(id) {
    const uri = `/api/file/delete/${id}`;
    return http.del(uri);
  },
  async getFile(conversationId, file) {
    const uri = `/api/conversations/${conversationId}/files_manager/select-file?file=${file}`;
    // 处理 access_token
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob(); // 获取 blob 数据

    // 打印文件内容并解析为可读格式
    const fileContent = await this.parseFileContent(blob, file);

    return fileContent; // 返回文件内容
  },
  
  parseFileContent(blob, fileName) {
    return new Promise((resolve, reject) => {
      const fileType = blob.type;

      if (fileType.startsWith('text/') || fileType === 'application/octet-stream') {
        // 尝试读取为文本
        const reader = new FileReader();
        reader.onload = () => {
          console.log(`File content of ${fileName}:`, reader.result);
          resolve(reader.result); // 返回文本内容
        };
        reader.onerror = () => {
          console.error('Error reading file:', reader.error);
          reject(reader.error); // 返回错误信息
        };
        reader.readAsText(blob); // 强制读取为文本
      } else if (fileType.startsWith('image/')) {
        // 图片文件处理逻辑
        const imageUrl = URL.createObjectURL(blob);
        console.log(`Image URL of ${fileName}:`, imageUrl);
        resolve(imageUrl); // 返回图片的 URL
      } else {
        console.log(`Unsupported file type: ${fileType}`);
        resolve(null); // 不支持的文件类型返回 null
      }
    });
  }
};

export default service;