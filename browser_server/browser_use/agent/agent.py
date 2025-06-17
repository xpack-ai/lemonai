from langchain_openai import ChatOpenAI
from browser_use import Agent
# from utils.read_file import read_file
import os
from pathlib import Path


class BrowserAgent:
    def __init__(self):
        # agent prompt path
        self.prompts_base_path = Path(__file__).parent.parent / 'agent' / 'prompt'
        self.prompts_extend_path = self.prompts_base_path / 'extend'
        self.prompts_extend = self._load_prompts(self.prompts_extend_path)
    
    def _load_prompts(self,prompt_files_path: Path):
        prompts = []
        for file_path in os.listdir(prompt_files_path):
            with open(os.path.join(prompt_files_path, file_path), 'r', encoding='utf-8') as file:
                prompts.append(file.read())
        return prompts

    def get_agent(self, task: str,model:str,api_key:str,base_url,extend_prompt_id:int=-1,browser_session = None):
        # init llm
        print(f"INFO   [system] Init LLM model:{model}; api_key:**************** ; base_url:{base_url}")
        llm = ChatOpenAI(model=model, api_key=api_key, base_url=base_url,
                         extra_body={"enable_thinking": False}, # disable thinking mode
                         )
        # get extend prompt
        extend_prompt = self.prompts_extend[extend_prompt_id]
        print(f"INFO    [system] system extend agent prompt:{extend_prompt}")
        tool_calling_method = 'auto'
        if 'doubao' in model:
            tool_calling_method = 'raw'
        return Agent(task=task, llm=llm,
                      override_system_message=None,
                      extend_system_message=extend_prompt,
                      browser_session = browser_session,
                      use_vision=False,
                      tool_calling_method=tool_calling_method
                      )
    def get_extend_prompt(self, prompt_id:int = 0):
        return self.prompts_extend[prompt_id]


browser_agent = BrowserAgent()

if  __name__ == "__main__":
    browser_agent = BrowserAgent()
    print(browser_agent.get_extend_prompt(1))