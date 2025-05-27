const TerminalRun = {
  name: "terminal_run",
  // description: "Execute the specified command in the terminal and return the result",
  description:"Execute the specified command in the terminal and return the result. For reading .docx and .doc and .pdf and .xlsx files:\n\n- For .docx files, try using 'pandoc <file_path> -t plain' or 'antiword <file_path>'.\n- For .pdf files, try using 'pdftotext <file_path> -' to output the text to standard output.\n\nPrioritize using 'pandoc' if available due to its broader format support. If these tools are not available, try other suitable command-line tools for reading these file types.",
  params: {
    type: "object",
    properties: {
      command: {
        description: "The command to execute",
        type: "string"
      },
      args: {
        description: "The list of command parameters",
        type: "string",
      },
      cwd: {
        description: "The working directory of the command execution",
        type: "string"
      }
    },
    required: ["command"]
  }
};

module.exports = TerminalRun;