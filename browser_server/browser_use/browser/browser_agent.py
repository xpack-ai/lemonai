import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Optional
from pathlib import Path

from langchain_openai import ChatOpenAI
from pyobjtojson import obj_to_json
from browser_use import Agent
from browser_use.browser.browser import Browser, BrowserConfig, BrowserContextConfig, BrowserContext


class BrowserAgentManager:
    def __init__(self, save_path: str | Path, max_steps: int):
        self.max_steps = int(max_steps)
        self.sessions: Dict[str, dict] = {}
        self.save_path = Path(save_path)
        self.save_path.mkdir(parents=True, exist_ok=True)
        self.browser_content_config = BrowserContextConfig(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        )
        self.browser = Browser(config=BrowserConfig(
            headless=True, disable_security=False, keep_alive=False))
        self.browser_content = BrowserContext(
            browser=self.browser, config=self.browser_content_config)

    def get_all_sessions_status(self) -> Dict[str, dict]:
        return self.sessions

    def new_task(self, task: str, model: str, api_key: str, base_url: str) -> str:
        if not all([task, model, api_key, base_url]):
            raise ValueError("Task, model, api_key, and base_url are required")

        uid = str(uuid.uuid4())
        try:
            llm = ChatOpenAI(model=model, api_key=api_key, base_url=base_url)
            # agent = Agent(llm=llm, browser=Browser(config=BrowserConfig(headless=False, disable_security=False, keep_alive=False)), task=task)
            agent = Agent(
                llm=llm, browser_context=self.browser_content, task=task)
            self.sessions[uid] = {
                "llm": llm,
                "agent": agent,
                "task": task,
                "browser_history": [],
                "browser_history_screenshot": [],
                "state": "init",
            }
            print(f"New session created with uid: {uid}")
            return uid
        except Exception as e:
            print(f"Error during task initialization: {str(e)}")
            raise RuntimeError(f"Failed to initialize task: {str(e)}")

    async def run_task(self, uid: str, save_history: bool = False):
        session = self.sessions.get(uid)
        if not session or not session.get("agent"):
            raise ValueError(f"No active session or agent for uid {uid}")
        try:
            session["state"] = "running"
            await session["agent"].run(
                on_step_end=lambda agent_obj: self._record_activity(
                    uid, agent_obj),
                max_steps=self.max_steps
            )
        except Exception as e:
            print(f"Error during task execution for uid {uid}: {str(e)}")
            session["state"] = "error"
            raise
        finally:
            agent_state = session["agent"].state
            session["state"] = (
                "error" if agent_state.consecutive_failures >= session["agent"].settings.max_failures
                else "stopped" if agent_state.stopped
                else "finish"
            )
            print(f"Session {uid} finished with status: {session['state']}")
            if save_history:
                self.save_history(uid, session)
                self._clear_session(uid)

    async def _record_activity(self, uid: str, agent_obj,
                               save_screenshot=False):
        if agent_obj.state.stopped:
            return
        session = self.sessions.get(uid)
        if not session:
            raise ValueError(f"No session found for uid {uid}")
        if save_screenshot:
            screenshot = await agent_obj.browser_context.take_screenshot()
        else:
            screenshot = None
        history = agent_obj.state.history
        model_outputs = obj_to_json(
            history.model_outputs() if history else [], check_circular=False)
        extracted_content = obj_to_json(
            history.extracted_content() if history else [], check_circular=False)
        urls = obj_to_json(history.urls() if history else [],
                           check_circular=False)

        step_summary = {
            "url": urls[-1] if urls else None,
            "model_outputs": model_outputs[-1] if model_outputs else None,
            "extracted_content": extracted_content[-1] if extracted_content else None,
        }
        session["browser_history"].append(step_summary)
        session["browser_history_screenshot"].append(screenshot)

    def get_status(self, uid: str) -> str:
        session = self.sessions.get(uid)
        if session:
            return session["state"]

        history_path = self.save_path / f"{uid}.json"
        if history_path.exists():
            with history_path.open("r", encoding="utf-8") as f:
                return json.load(f)["status"]
        raise ValueError(f"No session or history found for uid {uid}")

    def stop(self, uid: str):
        session = self.sessions.get(uid)
        if not session:
            raise ValueError(f"No session found for uid {uid}")
        if session["state"] == "running":
            session["agent"].stop()
            self._clear_session(uid)

    def _clear_session(self, uid: str):
        if uid in self.sessions:
            del self.sessions[uid]
            print(f"Session {uid} cleared")

    def clear_all_sessions(self):
        for uid in list(self.sessions.keys()):
            self._clear_session(uid)
        print("All sessions cleared")

    def get_last_history_and_screenshot(self, uid: str) -> Optional[dict]:
        content = self.get_history(uid, with_screenshot=True)
        if not content or not content.get("browser_history"):
            return None

        return {
            "uid": uid,
            "task": content["task"],
            "status": content["status"],
            "time": datetime.now().strftime("%Y%m%d%H%M%S"),
            "browser_history": [content["browser_history"][-1]],
            "browser_history_screenshot": [content["browser_history_screenshot"][-1]],
        }

    def get_history(self, uid: str, with_screenshot: bool = False) -> Optional[dict]:
        history_path = self.save_path / f"{uid}.json"
        if history_path.exists():
            with history_path.open("r", encoding="utf-8") as f:
                content = json.load(f)
                if not with_screenshot:
                    content.pop("browser_history_screenshot", None)
                return content

        session = self.sessions.get(uid)
        if not session:
            return None
        return {
            "uid": uid,
            "task": session["task"],
            "status": session["state"],
            "time": datetime.now().strftime("%Y%m%d%H%M%S"),
            "browser_history": session["browser_history"],
            "browser_history_screenshot": session["browser_history_screenshot"] if with_screenshot else [],
        }

    def save_history(self, uid: str, session: dict):

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        content = {
            "uid": uid,
            "task": session["task"],
            "status": session["state"],
            "time": timestamp,
            "browser_history": obj_to_json(session["browser_history"], check_circular=False),
            "browser_history_screenshot": obj_to_json(session["browser_history_screenshot"], check_circular=False),
        }
        with (self.save_path / f"{uid}.json").open("w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False, indent=2)

    def del_dao_history(self, uid: str):
        path = self.save_path / f"{uid}.json"
        # 删除文件
        if path.exists():
            path.unlink()
            return True
        else:
            return False
