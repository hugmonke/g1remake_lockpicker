from collections import defaultdict, deque
from enum import Enum
from typing import Dict, Set, Tuple, List, TypeVar, Hashable, Iterable, Generic, Optional
from dataclasses import dataclass
from types import MappingProxyType

#TODO
# Add typehints
# Add docstrings
# Create explanation
# ZZzzzZzz


# Type definitions
State = Tuple[int, ...]
Node = TypeVar("Node", bound=Hashable)
Transition = TypeVar("Transition")

@dataclass(frozen=True)
class LockConfiguration:
    """ How many sliders and what are the dependencies between them"""
   # rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)}
    rules : Dict[int, Tuple[int, ...]]
    min_bound : int = 0
    max_bound : int = 6

    def __post_init__(self):
        if self.rules:
            iterator = iter(self.rules.values())
            key_length = len(self.rules.keys())
            first_rule = next(iterator)

            
            if not isinstance(first_rule, tuple): raise TypeError("Bad ruleset: Each rule must be a tuple!")
            rule_length = len(next(iterator))

            if key_length != rule_length:
                raise ValueError("Bad ruleset: Rule length must match slider amount!")
            
            for rule in iterator:
                if len(rule) != rule_length:
                    raise ValueError("Bad ruleset: All rule tuples must be the same length!")

            if rule_length > self.max_bound+1 or rule_length == 0:
                    raise ValueError(f"Bad ruleset: Wrong amount of rules! Got {rule_length} rules")
            
        for rule in self.rules.values():
            for val in rule:
                if val != 0 and abs(val) != 1:
                    raise ValueError(f"Bad ruleset: Slider cannot move more than one hole per cycle!")
        # Bypass frozen=True to make immutable dictionary
        object.__setattr__(self, 'rules', MappingProxyType({key: tuple(val) for key, val in self.rules.items()}))

@dataclass(frozen=True)
class LockStartState:
    """ current state of the lock:
        - e.g (0, 2, 2, 4, 5) for a lock with 5 sliders, not solved,
        - or (3, 3, 3, 3) for a lock with 4 sliders, solved"""
    state : Tuple


class Direction(Enum):
    RIGHT = 'R'
    LEFT = 'L'

@dataclass(frozen=True)
class Move:
    "a single move, e.g. for first slider: (0, Direction.RIGHT)"
    slider_idx: int
    direction: Direction

    def __post_init__(self):
        if not (LockConfiguration.min_bound <= self.slider_idx <= LockConfiguration.max_bound):
            raise ValueError(f"slider_idx must be in range [0, 6], got {self.slider_idx}")
        
    def __str__(self) -> str:
        return f"{self.slider_idx+1}{self.direction.value}"
    
class Graph:
    """Unweighted graph implementation"""

    def __init__(self, config: LockConfiguration):
        self.config = config

    def validate_state(self, state: State) -> None:
        """Verifies if lock is within its physical limits"""
        if not state:
            raise ValueError("State cannot be empty.")
        
        for val in state:
            if not(self.config.min_bound <= val <= self.config.max_bound):
                raise ValueError(
                    f"State value {val} is out of bounds: [{self.config.min_bound}; {self.config.max_bound}]"
                )

    def get_neighbours(self, state: State) -> Iterable[Tuple[State, Move]]:
        # 17.09.2026 -> Completely rewritten logic // using yield instead of return for dynamical graph solving
        # merged add_neighbour and generate_graph logic
        # removed obsolete methods add_left and add_right
        # Graph class is no longer using recursion
        
        for rule_idx, rule_tuple in self.config.rules.items():
            for direction in (Direction.LEFT, Direction.RIGHT):
                mul = 1 if direction == Direction.RIGHT else -1
                new_lock_state: List[int] = []
                lock_valid: bool = True

                for value, diff in zip(state, rule_tuple):
                    new_val = value + mul*diff
                    if not (self.config.min_bound <= new_val <= self.config.max_bound):
                        lock_valid = False
                        break
                    new_lock_state.append(new_val)
                if lock_valid:
                    yield tuple(new_lock_state), Move(slider_idx=rule_idx, direction=direction)


    # Changed the way graph is (and if) built and printed for debugging purposes -> we dont really need to create the adjacency list (dict) for our solution

    def build_graph(self, start: LockStartState) -> Dict[State, List[Tuple[State, str]]]:
        self.validate_state(start.state)
        adjacency_dict: Dict[State, List[Tuple[State, str]]] = {}
        visited: Set[State] = {start.state}
        queue: deque[State] = deque([start.state])

        while queue:
            current_state = queue.popleft()
            adjacency_dict[current_state] = []

            for neighbour, move in self.get_neighbours(current_state):
                adjacency_dict[current_state].append((neighbour, move))
                if neighbour not in visited:
                    visited.add(neighbour)
                    queue.append(neighbour)

        return adjacency_dict

    def __repr__(self):
        return f"{self.__class__.__name__}({self.config})"

    
class Solution(Generic[Node, Transition]):
    def __init__(self, end_state):
        self.goal = end_state

    def bfs(self, graph, start) -> Optional[Tuple[List[Node], List[Transition]]]:
        graph.validate_state(start.state)
        if start.state == self.goal:
            return [start.state], []
        
        queue = deque([start.state])
        visited_nodes = set()
        visited_nodes.add(start.state)
        parent_of : Dict[Node, Tuple[Node, Transition]] = {}
        
        lock_solved = False
        while queue:
            current_node = queue.popleft()
            if current_node == self.goal:
                lock_solved = True
                break

            for child_node, move in graph.get_neighbours(state=current_node):
                if child_node not in visited_nodes:
                    visited_nodes.add(child_node)
                    parent_of[child_node] = (current_node, move)
                    queue.append(child_node)

        if not lock_solved:
            return None

        node = self.goal 
        solution_states : List[Node] = []
        solution_moves : List[Transition] = []

        while node != start.state:
            solution_states.append(node)
            prev_node, direction = parent_of[node]
            solution_moves.append(direction)
            node = prev_node

        solution_states.append(start.state)
        solution_states.reverse()
        solution_moves.reverse()

        return solution_states, solution_moves

        


if __name__ == "__main__":
    config = LockConfiguration(rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)})
    start = LockStartState(state = (1, 2, 6))
    end = tuple(3 for _ in range(len(config.rules.items())))
    graph = Graph(config=config)
    solver = Solution(end_state=end)
    path = solver.bfs(graph=graph, start=start)
    

    
    adj_dict = graph.build_graph(start=start)
    # print(adj_dict)
    # print(graph)
    print(path)