/**
 * @author: Trae | Gemini-2.5-Pro-Preview(0506)
 * @date 2025-06-17
 * 
 * Checks if the latest sequence of assistant messages forms an incomplete XML string.
 * The primary goal is to detect if an LLM is in the middle of streaming an XML response.
 * An XML string is considered incomplete if:
 * 1. It's non-empty and starts with '<'.
 * 2. And EITHER:
 *    a. The trimmed string does not end with '>'. (e.g., "<tag attr='val")
 *    b. OR the count of opening tags (e.g., <tag, <namespace:tag) is greater than
 *       the count of closing tags (e.g., </tag>).
 *
 * @param {Array<Object>} messages 
 * @returns {'to be continue' | 'invalid'} 
 */
const checkConsecutiveAssistantXml = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return 'invalid';
  }
  const assistantContents = [];
  // Iterate from the end to get the last sequence of assistant messages
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message && message.role === 'assistant' && typeof message.content === 'string') {
      // Add to the beginning to maintain order for join
      assistantContents.unshift(message.content);
    } else {
      // Stop if not an assistant message or if content is missing/not a string
      break;
    }
  }

  if (assistantContents.length === 0) {
    return 'invalid'; // No assistant messages at the end, or they had no content
  }

  const combinedContent = assistantContents.join('').trim();

  if (combinedContent === '') {
    return 'invalid'; // Empty content after combining and trimming
  }

  // Condition 1: Must start with '<' to be considered XML-like
  if (!combinedContent.startsWith('<')) {
    return 'invalid';
  }

  // Condition 2a: If it doesn't end with '>', it's likely incomplete
  if (!combinedContent.endsWith('>')) {
    return 'to be continue';
  }

  // Condition 2b: Count opening vs. closing tags
  // Counts '<' not followed by '/', '!', or '?' (basic opening tags)
  const openingTagCount = (combinedContent.match(/<(?![\/\?!])/g) || []).length;
  // Counts '</' (closing tags)
  const closingTagCount = (combinedContent.match(/<\//g) || []).length;

  if (openingTagCount > closingTagCount) {
    // If the string ends with '/>', it indicates a self-closing tag.
    // If this self-closing tag is the reason openingTagCount > closingTagCount
    // (i.e., openingTagCount is exactly one more than closingTagCount),
    // then it's considered balanced for the purpose of this check.
    // Examples:
    //   - "<tag />": openingTagCount=1, closingTagCount=0. 1 === 0+1. Should be 'invalid'.
    //   - "<parent><child /></parent>": openingTagCount=2, closingTagCount=1. 2 === 1+1. Should be 'invalid'.
    //   - "<parent><child />": openingTagCount=2, closingTagCount=0. 2 !== 0+1. Should be 'to be continue' (parent unclosed).
    if (combinedContent.endsWith('/>') && openingTagCount === closingTagCount + 1) {
      return 'invalid';
    }
    return 'to be continue';
  }

  // If none of the 'to be continue' conditions were met
  return 'invalid';
}

const completeMessagesContent = (messages) => {
  const assistantContents = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message && message.role === 'assistant' && typeof message.content === 'string') {
      // Add to the beginning to maintain order for join
      assistantContents.unshift(message.content);
    } else {
      // Stop if not an assistant message or if content is missing/not a string
      break;
    }
  }
  const completion = assistantContents.join('').trim();
  return completion
}

module.exports = {
  checkConsecutiveAssistantXml,
  completeMessagesContent
};