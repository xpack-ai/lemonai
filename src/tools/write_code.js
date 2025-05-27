const WriteCode = {
  name: "write_code",
  description: "Write html/node/python code to complete task, use python3 code with PyPDF2 to read PDF files",
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
  }
};

module.exports = WriteCode;