//引用sse
import de from '@/locals/lang/de';
import sse from '@/services/sse';
import fileServices from '@/services/files';
import { useChatStore } from '@/store/modules/chat';
import messageFun from './message';

const chatStore = useChatStore();

//处理files 的 conversation_id
const fileConversationId = async (files, conversation_id) => {
    //putFile
    files.forEach(async (file) => {
        await fileServices.putFile(file.id, conversation_id)
    });
};

async function sendMessage(question, conversationId, files) {
    let fileIds = [];
    console.log('当前文件files', files);
    if (files && files.length > 0) {
        fileIds = files.map(file => file.id);
        //   const dir_name = 'Conversation_' + this.context.conversation_id.slice(0, 6);  workspace_dir+dir_name+'upload'+filename
        // Modify files to include filepath
        files = files.map(file => {
            const filepath = `${file.workspace_dir}/Conversation_${conversationId.slice(0, 6)}/upload/${file.name}`;
            const filename = file.name;
            return { ...file, filepath,filename };
        });
        console.log('updatedFiles', files);
        await fileConversationId(files, conversationId)
    }
    //从会话中获取 message
    const messages = chatStore.messages;
    chatStore.status = 'running';
    chatStore.handleInitMessage(question, files);

    const uri = '/api/agent/run';
    const options = {
        question: question,
        conversation_id: conversationId,
        fileIds
    };

    let pending = false;

    const onTokenStream = (answer, ch) => {
        if (ch && ch.startsWith('{') && ch.endsWith('}')) {
            update(ch);
            return true;
        }
    };
    const onOpenStream = () => {
        pending = true;
    };
    const answer = '';
    const throttledScrollToBottom = () => {
        console.log('throttledScrollToBottom');
    };
    const abortController = new AbortController();
    sse(uri, options, onTokenStream, onOpenStream, answer, throttledScrollToBottom, abortController).then((res) => {
        chatStore.status = 'done';
        return res;
    }).catch((error) => {
        chatStore.status = 'done';
        console.error(error);
        return '';
    });
}

function update(ch) {
    let json;
    try {
        json = JSON.parse(ch);
    } catch (e) {
        console.error('Failed to parse JSON:', ch);
        return;
    }

    console.log('=== ch === ', json);

    const messages = chatStore.messages;
    const tempMessageIndex = findTemporaryAssistantMessage(messages);

    if (tempMessageIndex !== -1) {
        //删掉临时的助手消息
        messages.splice(tempMessageIndex, 1);
    }
    // messages.push(json);
    messageFun.handleMessage(json, messages);
    chatStore.scrollToBottom()
}

// 查找临时的助手消息
function findTemporaryAssistantMessage(messages) {
    return messages.findIndex(message => message.is_temp === true && message.role === 'assistant');
}



export default {
    sendMessage
};
