const read_file = {
  name: "read_file",
  description: "Read the content of the specified file path and return, support txt, md, xlsx, json, etc.",
  params: {
    type: "object",
    properties: {
      path: {
        description: "The path of the file to read.",
        type: "string"
      }
    },
    required: ["path"]
  }
};

module.exports = read_file;