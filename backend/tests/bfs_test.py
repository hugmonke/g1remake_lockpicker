import pytest
import sys

from dataclasses import FrozenInstanceError
import app.solver.bfs as app

# wip
# currently only testing Move class
# check out of bounds
# 
@pytest.mark.parametrize("slider_idx,direction,expected_str", [(0, app.Direction.RIGHT, "1R"), (0, app.Direction.LEFT, "1L"), (4, app.Direction.RIGHT, "5R")])

def test_move_formatting(slider_idx, direction, expected_str):
    """Move output should display idx+1 and direction char (R, L)."""
    move = app.Move(slider_idx=slider_idx, direction=direction)
    assert str(move) == expected_str


def test_move_immutability():
    """Modifying Move properties should raise FrozenInstanceError."""
    move = app.Move(slider_idx=0, direction=app.Direction.RIGHT)
    with pytest.raises(FrozenInstanceError):
        move.slider_idx = 1


def test_move_equality():
    """Should not raise AssertionError."""
    move1 = app.Move(slider_idx=3, direction=app.Direction.LEFT)
    move2 = app.Move(slider_idx=3, direction=app.Direction.LEFT)
    move3 = app.Move(slider_idx=3, direction=app.Direction.RIGHT)

    assert move1 == move2
    assert move1 != move3

@pytest.mark.parametrize("out_of_bounds_idx", [-1, 7, -99, 99])
def test_move_out_of_bounds(out_of_bounds_idx):
    """Move should raise ValueError if slider_idx is out of bounds."""
    with pytest.raises(ValueError):
        app.Move(slider_idx=out_of_bounds_idx, direction=app.Direction.RIGHT)

@pytest.mark.parametrize("in_bounds_idx", [0, 1, 2, 3, 4, 5, 6])
def test_move_in_bounds(in_bounds_idx):
    """Move should initialise for valid slider indices."""
    move = app.Move(slider_idx=in_bounds_idx, direction=app.Direction.RIGHT)
    assert move.slider_idx == in_bounds_idx

def test_state_immutability():
    """Modifying LockStartState properties should raise FrozenInstanceError."""
    state = app.LockStartState(state=(0, 3, 6))
    with pytest.raises(FrozenInstanceError):
        state.state = (3, 3, 3)

def test_state_equality_and_hashability():
    """Identical start states must be equal and hashable."""
    start_state1 = app.LockStartState(state=(0, 1, 2, 3))
    start_state2 = app.LockStartState(state=(0, 1, 2, 3))
    start_state3 = app.LockStartState(state=(4, 3, 2, 1))

    assert start_state1 == start_state2
    assert start_state1 != start_state3

    visited = {start_state1}
    assert start_state2 in visited  

    assert hash(start_state1) == hash(start_state2)

def test_configuration_immutability():
    """Modifying LockConfiguration properties should raise FrozenInstanceError."""
    config = app.LockConfiguration(rules={0: (0, 1, 0), 1: (1, 1, 1), 2: (0, 0, 0)})
    with pytest.raises(FrozenInstanceError):
        config.rules = {0: (0, 1, 0)}

def test_configuration_immutability():
    """Modifying LockConfiguration properties should raise FrozenInstanceError."""
    config = app.LockConfiguration(rules={0: (0, 1, 0), 1: (1, 1, 1), 2: (0, 0, 0)})
    with pytest.raises(FrozenInstanceError):
        config.rules = {0: (0, 1, 0)}

    with pytest.raises(FrozenInstanceError):
        config.min_bound = -1
        config.max_bound = 7

def test_configuration_rules_immutability():
    """Modifying LockConfiguration rules values should raise TypeError."""
    config = app.LockConfiguration(rules={0: (0, 1, 0), 1: (1, 1, 1), 2: (0, 0, 0)})
    with pytest.raises(TypeError):
        config.rules[0] = (0, 2, 0)

def test_configuration_bounds():
    """Bad LockConfiguration rules bounds should raise ValueError."""
    with pytest.raises(ValueError):
        config = app.LockConfiguration(rules={0: (0, 2, 0), 1: (1, 1, 1), 2: (0, 0, 0)})

def test_configuration_coherence():
    """Unequal LockConfiguration rules lengths should raise ValueError."""
    with pytest.raises(ValueError):
        config = app.LockConfiguration(rules={0: (0, 1, 0), 1: (1, 1, 1), 2: (0, 0, 0, 0)})

def test_configuration_length_max_constraint():
    """Too high LockConfiguration rules lengths should raise ValueError."""
    with pytest.raises(ValueError):
        config = app.LockConfiguration(rules={0: (0, 1, 0, 0, 0, 0, 0, 0), 1: (1, 1, 1, 0, 0, 0, 0, 0), 2: (0, 0, 0, 0, 0, 0, 0, 0)})

def test_configuration_length_min_constraint():
    """Too low LockConfiguration rules lengths should raise ValueError."""
    with pytest.raises(ValueError):
        config = app.LockConfiguration(rules={0: (0,), 1: (1,), 2: (0,)})

def test_configuration_type_constraint():
    """Wrong LockConfiguration rules type should raise TypeError."""
    with pytest.raises(TypeError):
        config = app.LockConfiguration(rules={0: (0), 1: (1), 2: (0)})

def test_empty_state():
    """Empty state tuple should raise ValueError."""
    start = app.LockStartState(state = ())
    config = app.LockConfiguration(rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)})
    graph = app.Graph(config=config)
    with pytest.raises(ValueError):
        graph.validate_state(start.state)

def test_state_bounds():
    """States below min_bounds or above max_bounds should be DESTROYED (raise ValueError)."""
    state = (0, 0, -1)
    config = app.LockConfiguration(rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)})
    graph = app.Graph(config=config)
    with pytest.raises(ValueError):
        graph.validate_state(state)

def test_expected_neighbours():
    """Tests if a state gets expected amount of neighbours."""
    state = (0, 3, 6)
    config = app.LockConfiguration(rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)})
    graph = app.Graph(config=config)
    neighbour_amnt = 0
    for n, _ in graph.get_neighbours(state=state):  # (1, 3, 6), (0, 2, 5)
        neighbour_amnt += 1
    assert neighbour_amnt == 2

def test_solved_start_state():
    """Test if solved start state immediately returns solution."""
    solved_lock = (3, 3, 3)
    start = app.LockStartState(state = (3, 3, 3))
    config = app.LockConfiguration(rules = {0: (1, 0, 0), 1: (0, 1, 1), 2: (1, 0, 1)})
    graph = app.Graph(config=config)
    solver = app.Solution(end_state=solved_lock)
    result = solver.bfs(graph=graph, start=start)
    assert result == ([solved_lock], [])
    
#TODO add tests:

def test_movement_filtration():
    """Test if movements pushing values of out bounds are correctly ANNIHILATED."""
    pass

def test_build_graph():
    """Test correctness of adjacency dictionary from build_graph method."""
    pass

def test_build_graph():
    """Test if infinite loop is possible (how? idk yet:P)"""
    pass




#Test some known solutions to check for algorithm limitations

#Test some impossible configuration

#Test that passing an out of bounds start state directly into Solution.bfs triggers a ValueError through state validation.