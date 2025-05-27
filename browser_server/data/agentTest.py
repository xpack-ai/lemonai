import os

from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv

load_dotenv()

import asyncio


# api_key = os.getenv("DEEPSEEK_API_KEY")
llm = ChatOpenAI(model="deepseek-chat",base_url="https://api.deepseek.com/v1")

async def main():
    agent = Agent(
        task="找到当前的日本地图，将其浏览器页面截图并保存到screenshots文件夹,后缀为png",
        llm=llm,
        use_vision=False,
        # save_conversation_path = "logs/conversation"
    )
    result = await agent.run()
    print(result)


asyncio.run(main())
