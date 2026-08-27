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
        self.rules = None

    def add_node(self, a, b):
        self._graph[a].add(b)
        if not self.is_directed:
            self._graph[b].add(a)

    def add_multiple_nodes(self, connections):
        # Deprecated:)
        for key, value in connections:
            self.add_node(key, value)

    def bfs(self, start):
        visited_bfs = set()
        queue = deque([start])
        parent_node = {start: None}
        visited_bfs.add(start)
        
        while queue:
            curr_node = queue.popleft()
            if curr_node == self.goal:
                break

            for child_node in self._graph[curr_node]:
                if child_node not in visited_bfs:
                    visited_bfs.add(child_node)
                    parent_node[child_node] = curr_node
                    queue.append(child_node)

        if self.goal not in parent_node:
            return []

        res = []
        node = self.goal

        while node is not None:
            res.append(node)
            node = parent_node[node]

        res.reverse()
        return res

    def generate_combinations(self, node):
        if node in self.visited_nodes:
            return
        
        self.visited_nodes.add(node)
    
        for i in range(len(node)):
            if node[i]-1 >= self._min:
                new_left = node[0:i] + (node[i]-1,) + node[i+1:] 
                if new_left not in self.visited_nodes:
                    self.add_node(node, new_left)
                    self.stack.append(new_left)

            if node[i]+1 <= self._max:
                new_right = node[0:i] + (node[i]+1,) + node[i+1:]
                if new_right not in self.visited_nodes:
                    self.add_node(node, new_right)
                    self.stack.append(new_right)
                
        node = self.stack.pop()
        self.generate_combinations(node)

        if self.stack == []:
            return

    
    def __str__(self):
        return f'{str(self.__class__.__name__)}{str(dict(self._graph))}'


start = (1, 2, 5)
g = Graph(start)
g.rules = {0: (0, 0, -1), 1: (0, 1, 0), 2: (1, 0, -1)}
g.generate_combinations(g._start)
#print(g)
#print(g.goal)
#print(g.bfs(start))

def test():
    tuple1 = (1, 2, 5)
    rules = {0: (0, 0, -1), 1: (1, 0, 0), 2: (1, -1, 0)}
    res = []
    
    for i in range(len(tuple1)):
        new_tuple = ()
        # 1. check if basic movement on i-th element is allowed
        if tuple1[i]-1 >= 0:
            # if we can move the i-th element
            # we then have to check what rules follows (if any)
            # and if those rules (moves) are allowed
            # 2. if its allowed - get rules for ith elements
            # 2.1 
            rule_tuple = rules[i]
            for j in range(len(tuple1)):
                # if i == j AND due to a bug we have a rule for the same i-th element we are trying to change, we may accidentally use the rule to change i-th element's value more than once (we dont want to do that)
                if j != i and tuple1[j] + rule_tuple[j] >= 0 and tuple1[j] + rule_tuple[j] <= 6:
                    new_tuple += (tuple1[j] + rule_tuple[j],)
                else:
                    new_tuple += (tuple1[j] - 1,)
            res.append(new_tuple)
    return res

print(test())