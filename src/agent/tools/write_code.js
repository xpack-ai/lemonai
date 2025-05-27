const WriteCode = {
  name: "write_code",
  description: "Write the code content to the specified file path.",
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
  }
};

module.exports = WriteCode;