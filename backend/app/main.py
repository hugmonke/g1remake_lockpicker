#place for api requests, eg fastapi

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Tuple, Dict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from solver.bfs import LockConfiguration, LockStartState, Graph, Solution

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://hugmonke.github.io"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)



class LockState(BaseModel):
   start_lock_state: Tuple[int, ...]

class LockConfig(BaseModel):
   start_lock_config: Dict[int, Tuple[int, ...]]


@app.post("/lock_input")
@limiter.limit("10/minute")
async def index(request: Request, lock_state: LockState, lock_config: LockConfig):

   config = LockConfiguration(rules = lock_config.start_lock_config) # {0:(1,0,0),1:(0,1,1),2:(1,0,1)}
   start = LockStartState(state = lock_state.start_lock_state) # (1,2,6)
   
   end = tuple(3 for _ in range(len(config.rules.items())))
   graph = Graph(config=config)
   solver = Solution(end_state=end)
   path = solver.bfs(graph=graph, start=start)


   return {
        "lock state": lock_state.start_lock_state,
        "lock config": lock_config.start_lock_config,
        "solution": path
   }
