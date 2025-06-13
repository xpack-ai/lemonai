//引用sse
import sse from '@/services/sse';
import fileServices from '@/services/files';
import { useChatStore } from '@/store/modules/chat';
import messageFun from './message';
import userService from '@/services/auth'

import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/modules/user.js'
const userStore = useUserStore();
const { user, membership, points } = storeToRefs(userStore);




//获取用户信息 getUserInfo
async function getUserInfo() {
  let res = await userService.getUserInfo();
  //设置缓存
  membership.value = res.membership;
  points.value = res.points;
}


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
    //给当前chatStore 添加 一个状态
    // chatStore.list.find((c) => c.conversation_id == conversationId).status = 'running';
    chatStore.handleInitMessage(question, files);
    let baseURL = ""
    //判断是不是开发环境
    if(import.meta.env.DEV){
      baseURL = ""
    }else{
      baseURL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';
    }
    const uri = `${baseURL}/api/agent/run`;
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
        return res;
    }).catch((error) => {
       
        console.error(error);
        return '';
    }).finally(() => {
        chatStore.list.find((c) => c.conversation_id == conversationId).status = 'done';
        getUserInfo();
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
