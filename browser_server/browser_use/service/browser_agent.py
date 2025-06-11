from agent.agent import browser_agent
from config.load_config import config
from browser.browser import browser_factory
import uuid
from datetime import datetime
from typing import Dict, Optional


class BrowserAgentManager:

    def __init__(self):
        self.browser_session = browser_factory.create_shared_session(headless=True)
        pass

    async def run_task_only(self, task: str, model: str, api_key: str, base_url: str) -> str:
        uid = str(uuid.uuid4())
        agent = browser_agent.get_agent(task=task,model=model,api_key=api_key,base_url=base_url,browser_session = self.browser_session)
        history = await agent.run(max_steps=config['agent']['max_steps'])
        result = self._format_history(history)
        # the run task only return the last result of history
        print(f"[INFO]    [user]✅ task finished:{task};history summary:\n {self._format_history(history=history)}",end="\n\n")
        total_duration_seconds = history.total_duration_seconds()
        total_input_tokens = history.total_input_tokens()
        is_successful = history.is_successful()
        is_done = history.is_done()
        number_of_steps = history.number_of_steps()
        return {
            "uid": uid,
            "task": task,
            "status": "finished",
            "time": datetime.now().strftime("%Y%m%d%H%M%S"),
            "browser_history":   result,
            "browser_history_screenshot": history.screenshots(),
            "total_duration_seconds":total_duration_seconds,
            "total_tokens":total_input_tokens,
            "is_successful":is_successful,
            "is_done":is_done,
            "number_of_steps":number_of_steps,
        }

    @staticmethod
    def _format_history(history):
        extracted_content = history.extracted_content()
        urls = history.urls()
        errors = history.errors()
        result = []
        for i in range(len(extracted_content)):
            result.append({
                "extracted_content":extracted_content[i],
                "url":urls[i],
                "error": errors[i]
            })
        return result

    @staticmethod
    def _get_screenshot_final(history):
        last_screenshot = None
        if len(history.screenshots())>0:
            last_screenshot = history.screenshots()[-1]
        return last_screenshot


    
browser_agent_manager = BrowserAgentManager()





    


