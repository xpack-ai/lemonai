const { json2xml } = require('@src/utils/format');

const WriteCode = {
  name: "write_code",
  description: "Write html/node/python code to complete task, write markdown to generate requirement/report/design , use python3 code with PyPDF2 to read PDF files",
  params: {
    type: "object",
    properties: {
      path: {
        description: "The path of the file to write.",
        type: "string"
      },
      content: {
        description: "The code content to write.",
        type: "string"
      }
    },
    required: ["path", "content"]
  },
  getActionDescription({ path }) {
    return path;
  },
  /**
   * 自定义记忆内容
   * @param {*} action 
   * @param {*} content 
   * @returns 
   */
  resolveMemory(action = {}, content) {
    const memory = {
      type: 'write_code',
      status: 'success',
      path: action.params.path
    }
    return json2xml(memory);
  }
};

module.exports = WriteCode;