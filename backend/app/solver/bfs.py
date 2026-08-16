
class LockConfiguration:
    """ how many sliders and what are the dependencies between them"""
    def __init__(self):
        return


class LockState:
    """ current state of the lock:
        - e.g [-3, 0, 0, 1, 3] for a lock with 5 sliders, not solved,
        - or [0, 0, 0, 0] for a lock with 4 sliders, solved"""
    def __init__(self):
        return


class Direction(Enum):
    """i believe it's self explanatory"""
    RIGHT = 1
    LEFT = -1

class Move:
    "a single move, e.g. for first slider: (0, Direction.RIGHT)"
    def __init__(self):
        return


class Solution:
    def __init__(self, config, state):
        """generate a graph based on LockConfiguration and LockState"""
        return

    def check_if_solved(self):
        return

    def check_if_possible_move(self):
        return

    def solve(self):
        """bfs for possible moves"""
        return