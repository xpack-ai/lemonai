const parseJSON = (content) => {

  content = content.trim();

  // 检查是否包含 JSON 代码块
  const jsonBlockMatch = content.match(/```json\s*\n?([\s\S]*?)\n?\s*```/);
  if (jsonBlockMatch) {
    try {
      const jsonContent = jsonBlockMatch[1].trim();
      // console.log('Extracted JSON:', jsonContent);
      return JSON.parse(jsonContent);
    } catch (parseErr) {
      console.log('JSON parse error in code block:', parseErr);
      throw new Error(`parseJSON failed (code block): ${parseErr.message}`);
    }
  }

  // 尝试直接解析整个内容
  try {
    return JSON.parse(content);
  } catch (err) {
    if (content === 'ERR_BAD_REQUEST') {
      throw new Error(`Large model call failed`);
    } else {
      console.log('Direct parse error:', err);
      throw new Error(`parseJSON failed: ${err.message}`);
    }
  }
}

module.exports = exports = parseJSON;

// const fs = require('fs');
// const filepath = require('path').resolve(__dirname, './json.txt');
// const content = fs.readFileSync(filepath, 'utf8');
// console.log((content));
// const json = parseJSON(content);
// console.log('json', json);