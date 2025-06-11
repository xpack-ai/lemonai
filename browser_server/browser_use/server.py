import datetime
import os
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from service.browser_agent import browser_agent_manager
from config.load_config import config
def init():
    #  must be set OPENAI_API_KEY ENV
    os.environ["OPENAI_API_KEY"] = ""
    # SKIP_LLM_API_KEY_VERIFICATION = true  ;this not work
    # os.environ["SKIP_LLM_API_KEY_VERIFICATION"] = 'true'
    # print(os.environ)
    return

class TaskRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    llm_config: dict = Field(...,
                             description="包含 model_name, api_key, api_url")
    
def create_response(code: int, message: str, data: dict) -> dict:
    return {"code": code, "message": message, "data": data}


async def parse_task_request(request: Request) -> TaskRequest:
    """
    parse task request
    """
    try:
        data = await request.json()
        task = TaskRequest(**data)
        llm_config = task.llm_config
        if not all([llm_config.get(k) for k in ["model_name", "api_key", "api_url"]]):
            raise HTTPException(status_code=400, detail="Invalid llm_config")
        return task
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    
app = FastAPI()

@app.post("/api/browser/task")
async def browser_task(request: Request):
    start_time = datetime.datetime.now()
    task = await parse_task_request(request)
    print(f"[INFO]    [agent] recevied task :{task}")
    llm_config = task.llm_config
    # try:
    history = await browser_agent_manager.run_task_only(
        task.prompt,
        model=llm_config["model_name"],
        api_key=llm_config["api_key"],
        base_url=llm_config["api_url"],
    )
    end_time = datetime.datetime.now()
    response = create_response(
        200,
        "Task completed",
        {
            "time": datetime.datetime.now().isoformat(),
            "time_cost": (end_time - start_time).total_seconds(),
            "history": history
        },
    )
    # print(f"the task:{task.prompt} result:",response,"\n\n",end=None)
    return response
    # except Exception as e:
    #     print("ERROR     [system]", e)
    #     raise HTTPException(status_code=500, detail=str(e))
    

if __name__ == "__main__":
    import uvicorn
    init()
    uvicorn.run(app, host=config['server']['host'], port=config['server']['port'])