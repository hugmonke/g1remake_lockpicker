import numpy as np
from collections import defaultdict, deque
import copy

class Graph():

    def __init__(self, start):
        self._graph = defaultdict(set)
        self._start = start
        if start is not None:
            self._graph[start]
        self._min = 0
        self._max = 6 
        self.visited_nodes = set()
        self.stack = []
        self.is_directed = True
        self.goal = tuple(2 for _ in range(len(start)))
        self.rules = defaultdict(int)
        self.moves = {}


    def add_node(self, a, b):
        self._graph[a].add(b)
        if not self.is_directed:
            self._graph[b].add(a)

    def bfs(self, start):
        visited_bfs = set()
        queue = deque([start])
        parent_of = {start: None}
        visited_bfs.add(start)
        
        while queue:
            curr_node = queue.popleft()
            if curr_node == self.goal:
                break

            for child_node in self._graph[curr_node]:
                if child_node not in visited_bfs:
                    visited_bfs.add(child_node)
                    parent_of[child_node] = curr_node
                    queue.append(child_node)
        if self.goal not in parent_of:
            return None, None
        res = []
        moves = []
        moveset = []
        node = self.goal

        while node is not None:
            res.append(node)
            if parent_of[node] is not None:
                direction = np.subtract(node, parent_of[node])
                moves.append(direction)
            node = parent_of[node]

        for move in moves:
            for j in range(len(self.rules)):
                if tuple(move) == list(self.rules.values())[j]:
                    moveset.append(f'{j+1}R')
                    break
                elif tuple(move) == tuple(-np.array(list(self.rules.values())[j])):
                    moveset.append(f'{j+1}L')
                    break
                
        res.reverse()
        moveset.reverse()
        if res is None or moveset is None:
            return None, None
        return res, moveset

    def generate_combinations(self, node):
        if node in self.visited_nodes:
            return
        
        self.visited_nodes.add(node)
        for i in range(len(node)):
            rule_tuple = self.rules[i]
            new_left = ()
            for j in range(len(node)):
                if node[j] - rule_tuple[j] >= self._min and node[j] - rule_tuple[j] <= self._max:
                    new_left += (node[j] - rule_tuple[j],)
                else:
                    new_left = ()
                    break
            if new_left not in self.visited_nodes: 
                self.add_node(node, new_left)
                self.stack.append(new_left)
            new_right = ()
            for j in range(len(node)):
                if node[j] + rule_tuple[j] >= self._min and node[j] + rule_tuple[j] <= self._max:
                    new_right += (node[j] + rule_tuple[j],)
                else:
                    new_right = ()
                    break
            if new_right not in self.visited_nodes:
                self.add_node(node, new_right) 
                self.stack.append(new_right)
        if self.stack == []:
            return     
        node = self.stack.pop()
        self.generate_combinations(node)

        

    
    def __str__(self):
        return f'{str(self.__class__.__name__)}{str(dict(self._graph))}'


start = (1, 2, 6)
g = Graph(start)
g.rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)}
g.generate_combinations(g._start)
#print(g)
#print(g.goal)

res, moveset = g.bfs(start)
#print(g.moves)
print(g.rules)
print(res)
print(moveset)
if moveset is not None and res is not None:
    print(len(moveset), len(res))   
# for r in res[1:]:
#     print(g.moves[r])