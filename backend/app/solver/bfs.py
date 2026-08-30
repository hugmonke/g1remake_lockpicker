from collections import defaultdict, deque
import numpy as np
from enum import Enum
class LockConfiguration:
    """ how many sliders and what are the dependencies between them"""
    rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)}
    min = 0
    max = 6



class LockState:
    """ current state of the lock:
        - e.g [0, 2, 2, 4, 5] for a lock with 5 sliders, not solved,
        - or [2, 2, 2, 2] for a lock with 4 sliders, solved"""
    state = (1, 2, 6)



class Direction(Enum):
    """+1 is Right, -1 is Left"""
    RIGHT = 1
    LEFT = -1

class Move:
    "a single move, e.g. for first slider: (0, Direction.RIGHT)"
    def __init__(self):
        return
    
class Graph():
    """Unweighted graph implementation"""

    def __init__(self, is_directed=False):
        self.graph = defaultdict(set)
        self.generated_nodes = set()
        
        self.is_directed = is_directed
        self.stack = []

    def add_node(self, a, b):
        self.graph[a].add(b)
        if not self.is_directed:
            self.graph[b].add(a)

    def is_move_possible(self, val, rule, add):
        if add:
            return LockConfiguration.min <= val + rule <= LockConfiguration.max
        else:
            return LockConfiguration.min <= val - rule <= LockConfiguration.max
         

    def add_neighbour(self, node, rule_tuple, add):
        new = ()
        
        for val, rule in zip(node, rule_tuple):
            if self.is_move_possible(val=val, rule=rule, add=add): 
                new_val = val + rule if add else val - rule
                new += (new_val,)
            else:
                new = ()
                break

        if new not in self.generated_nodes:
            self.add_node(node, new) 
            self.stack.append(new)

    def add_left(self, node, rule_tuple):
        self.add_neighbour(node, rule_tuple, add=False)

    def add_right(self, node, rule_tuple):
        self.add_neighbour(node, rule_tuple, add=True)

    def generate_graph(self, node):
        if node in self.generated_nodes: return
        self.generated_nodes.add(node)        
        #print(node, LockConfiguration.rules.values())
        for rule_tuple in LockConfiguration.rules.values():
            self.add_left(node, rule_tuple)
            self.add_right(node, rule_tuple)
            
        if self.stack == []: return   
            
        node = self.stack.pop()
        self.generate_graph(node)

    def __str__(self):
        return f'{str(self.__class__.__name__)}{str(dict(self.graph))}'

class Solution(Graph):
    def __init__(self):
        """generate a graph based on LockConfiguration and LockState"""
        super().__init__(is_directed=False)
        self.solved = False
        self.solvable = False
        self.solution_nodes = []
        self.solution_moves = []
        self.move_list = []
        self.start = LockState.state
        self.parent_of = {self.start: None}
        self.goal = tuple(2 for _ in range(len(self.start)))
        return

    def is_lock_solvable(self):
        """Checks if the lock is within constrains and has a solution."""
        return self.solvable

    def is_lock_solved(self):
        return self.solved

    def bfs(self):
        """BFS for possible moves"""
        visited_nodes = set()
        queue = deque([self.start])
        visited_nodes.add(self.start)

        while queue:
            current_node = queue.popleft()
            if current_node == self.goal:
                break

            for child_node in self.graph[current_node]:
                if child_node not in visited_nodes:
                    visited_nodes.add(child_node)
                    self.parent_of[child_node] = current_node
                    queue.append(child_node)


    def get_shortest_path(self):   
        if self.goal not in self.parent_of:
            print(self.parent_of)
            self.solvable = False
            self.solved = False
            return
        self.solvable = True
        node = self.goal 
        self.res = [] #TEMPORARY
        while node is not None:
            self.res.append(node)
            if self.parent_of[node] is not None:
                direction = np.subtract(node, self.parent_of[node])
                self.solution_moves.append(direction)
            node = self.parent_of[node]
        self.res.reverse()
    def create_moves_list(self):
        #TODO: SUPER UGLY
        if not self.solvable: return # Lock is not yet solved, cannot return solution moves
        self.solution_moves.reverse()
        for move in self.solution_moves:
            for j in range(len(LockConfiguration.rules)):
                if tuple(move) == list(LockConfiguration.rules.values())[j]:
                    self.move_list.append(f'{j+1}R')
                    break
                elif tuple(move) == tuple(-np.array(list(LockConfiguration.rules.values())[j])):
                    self.move_list.append(f'{j+1}L')
                    break

        
        self.solved = True

    def solve_lock(self):
        print('Generating graph...')
        self.generate_graph(self.start)
        print('BFS...')
        self.bfs()
        print('Getting shortest path...')
        self.get_shortest_path()
        print('Creating moves list...')
        self.create_moves_list()
        print('Done!')
        



solver = Solution()
solver.solve_lock()
print(solver.res)
print(solver.move_list)