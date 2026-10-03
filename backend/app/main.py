#place for api requests, eg fastapi

from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Tuple, Dict

from solver.bfs import LockConfiguration, LockStartState, Graph, Solution

app = FastAPI()

app.mount('/static', StaticFiles(directory="../../frontend/build/static"), 'static')

origins = [
    "http://localhost:3000",
    "localhost:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class LockState(BaseModel):
   start_lock_state: Tuple[int, ...]

class LockConfig(BaseModel):
   start_lock_config: Dict[int, Tuple[int, ...]]


@app.post("/lock_input")
async def index(lock_state: LockState, lock_config: LockConfig):

   config = LockConfiguration(rules = lock_config.start_lock_config) # {0:(1,0,0),1:(0,1,1),2:(1,0,1)}
   start = LockStartState(state = lock_state.start_lock_state) # (1,2,6)
   
   end = tuple(2 for _ in range(len(config.rules.items())))
   graph = Graph(config=config)
   solver = Solution(end_state=end)
   path = solver.bfs(graph=graph, start=start)


   return {
        "lock state": lock_state.start_lock_state,
        "lock config": lock_config.start_lock_config,
        "solution": path
   }
