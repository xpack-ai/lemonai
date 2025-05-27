import asyncio
import datetime
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from browser.browser_agent import BrowserAgentManager
from dotenv import load_dotenv

load_dotenv()

# 获取项目根路径（browseUse/）
PROJECT_ROOT = Path(__file__).parent.parent  # browseUse/

# 设置 SAVE_PATH
SAVE_PATH = os.environ.get("SAVE_PATH", "data/records")
SAVE_PATH = (PROJECT_ROOT / SAVE_PATH).resolve()
SAVE_PATH.mkdir(parents=True, exist_ok=True)

MAX_STEPS = os.environ.get("MAX_STEPS", 10)  # 默认值
app = FastAPI()
browser_agent_manager = BrowserAgentManager(
    max_steps=MAX_STEPS, save_path=SAVE_PATH)

# 请求模型


class TaskRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    llm_config: dict = Field(...,
                             description="包含 model_name, api_key, api_url")

# 统一响应格式


def create_response(code: int, message: str, data: dict) -> dict:
    return {"code": code, "message": message, "data": data}

# 提取公共的请求解析和验证逻辑


async def parse_task_request(request: Request) -> TaskRequest:
    try:
        data = await request.json()
        task = TaskRequest(**data)
        llm_config = task.llm_config
        if not all([llm_config.get(k) for k in ["model_name", "api_key", "api_url"]]):
            raise HTTPException(status_code=400, detail="Invalid llm_config")
        return task
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid JSON data")


@app.post("/api/browser/task")
async def browser_task(request: Request):
    start_time = datetime.datetime.now()
    task = await parse_task_request(request)
    llm_config = task.llm_config

    try:
        uid = browser_agent_manager.new_task(
            task.prompt,
            model=llm_config["model_name"],
            api_key=llm_config["api_key"],
            base_url=llm_config["api_url"],
        )
        await browser_agent_manager.run_task(uid)
        history = browser_agent_manager.get_history(uid, with_screenshot=True)
        browser_agent_manager._clear_session(uid)
        end_time = datetime.datetime.now()
        return create_response(
            200,
            "Task completed",
            {
                "time": datetime.datetime.now().isoformat(),
                "time_cost": (end_time - start_time).total_seconds(),
                "history": history
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/browser/task/new")
async def new_task_run(request: Request):
    task = await parse_task_request(request)
    llm_config = task.llm_config

    try:
        uid = browser_agent_manager.new_task(
            task.prompt,
            model=llm_config["model_name"],
            api_key=llm_config["api_key"],
            base_url=llm_config["api_url"],
        )
        asyncio.create_task(
            browser_agent_manager.run_task(uid, save_history=True))
        return create_response(
            200,
            "Task created successfully",
            {
                "task": task.prompt,
                "uid": uid,
                "time": datetime.datetime.now().isoformat(),
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/browser/task/{uid}")
async def get_task_status(uid: str):
    try:
        status = browser_agent_manager.get_status(uid)
        return create_response(200, f"Task is {status}", {"status": status})
    except ValueError as e:
        return create_response(400, "Task not found", {"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/browser/task/{uid}/history")
async def get_task_history(uid: str):
    try:
        status = browser_agent_manager.get_status(uid)
        history = browser_agent_manager.get_history(uid)
        return create_response(
            200, f"Task is {status}", {"history": history}
        )
    except ValueError as e:
        return create_response(400, "Task not found", {"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/browser/task/{uid}/last_history_and_screenshot")
async def get_task_last_history_and_screenshot(uid: str):
    try:
        history = browser_agent_manager.get_last_history_and_screenshot(uid)
        return create_response(
            200,
            f"Task {uid} last history and screenshot",
            {"history": history},
        )
    except ValueError as e:
        return create_response(400, "Task not found", {"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/browser/task/{uid}/stop")
async def stop_task(uid: str):
    try:
        browser_agent_manager.stop(uid)
        return create_response(200, "Task stopped", {"status": "deleted"})
    except ValueError as e:
        return create_response(400, "Task not found", {"error": str(e)})


@app.get("/api/browser/task/all")
async def get_all_task_status():
    try:
        status = browser_agent_manager.get_all_sessions_status()
        return create_response(200, "All task status", {"status": status})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/browser/task/{uid}")
async def del_save_json(uid: str):
    try:
        if browser_agent_manager.del_dao_history(uid):
            return create_response(200, "hisotry deleted", {"message": "Task deleted"})
        else:
            return create_response(400, "hisotry not found", {"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
