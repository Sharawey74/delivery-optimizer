import networkx as nx
import heapq

NODE_POSITIONS = {
    0:  (30.0444, 31.2357),
    1:  (30.0500, 31.2400),
    2:  (30.0560, 31.2450),
    3:  (30.0480, 31.2500),
    4:  (30.0420, 31.2480),
    5:  (30.0380, 31.2420),
    6:  (30.0350, 31.2360),
    7:  (30.0400, 31.2300),
    8:  (30.0460, 31.2280),
    9:  (30.0520, 31.2320),
    10: (30.0580, 31.2380),
    11: (30.0600, 31.2430),
    12: (30.0540, 31.2530),
    13: (30.0470, 31.2560),
    14: (30.0410, 31.2540),
    15: (30.0360, 31.2510),
    16: (30.0320, 31.2450),
    17: (30.0300, 31.2390),
    18: (30.0340, 31.2330),
    19: (30.0390, 31.2260)
}

EDGES = [
    (0,1,40), (0,7,50), (0,8,60), (1,2,35), (1,9,45),
    (2,3,30), (2,10,40), (3,4,35), (3,12,50), (4,5,30),
    (4,13,45), (4,14,55), (5,6,25), (5,15,40), (6,7,35),
    (6,16,50), (7,8,30), (7,19,45), (8,9,40), (8,18,35),
    (9,10,35), (9,0,55), (10,11,30), (10,2,40), (11,12,35),
    (11,3,50), (12,13,30), (13,14,35), (14,15,40), (15,16,35),
    (16,17,30), (17,18,40), (18,19,35), (19,6,60)
]

ROAD_GRAPH = nx.Graph()
ROAD_GRAPH.add_nodes_from(NODE_POSITIONS.keys())
for u, v, weight in EDGES:
    ROAD_GRAPH.add_edge(u, v, weight=weight)

CLOSED_EDGES = set()

def dijkstra(source: int) -> dict[int, float]:
    """
    Returns dict mapping each node to its shortest travel time from source.
    Uses a min-heap. Skips edges in CLOSED_EDGES.
    """
    dist = {n: float('inf') for n in ROAD_GRAPH.nodes}
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        cost, u = heapq.heappop(heap)
        if cost > dist[u]:
            continue
        for v, data in ROAD_GRAPH[u].items():
            if (min(u, v), max(u, v)) in CLOSED_EDGES:
                continue
            new_cost = cost + data['weight']
            if new_cost < dist[v]:
                dist[v] = new_cost
                heapq.heappush(heap, (new_cost, v))
    return dist

def shortest_path_cost(source: int, target: int) -> float:
    """Returns travel cost from source to target. Returns inf if unreachable."""
    return dijkstra(source)[target]

def get_shortest_path(source: int, target: int) -> list[int]:
    """
    Returns the actual path as a list of node ids.
    Implements Dijkstra with parent tracking.
    """
    dist = {n: float('inf') for n in ROAD_GRAPH.nodes}
    parent = {n: None for n in ROAD_GRAPH.nodes}
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        cost, u = heapq.heappop(heap)
        if cost > dist[u]:
            continue
        if u == target:
            break
        for v, data in ROAD_GRAPH[u].items():
            if (min(u, v), max(u, v)) in CLOSED_EDGES:
                continue
            new_cost = cost + data['weight']
            if new_cost < dist[v]:
                dist[v] = new_cost
                parent[v] = u
                heapq.heappush(heap, (new_cost, v))
    
    if dist[target] == float('inf'):
        return []
    
    path = []
    curr = target
    while curr is not None:
        path.append(curr)
        curr = parent[curr]
    return path[::-1]

def close_road(u: int, v: int):
    """Adds (min(u,v), max(u,v)) to CLOSED_EDGES."""
    CLOSED_EDGES.add((min(u, v), max(u, v)))

def reopen_road(u: int, v: int):
    """Removes edge from CLOSED_EDGES if present."""
    edge = (min(u, v), max(u, v))
    if edge in CLOSED_EDGES:
        CLOSED_EDGES.remove(edge)

def get_route_cost(route: list[int]) -> float:
    """Returns total travel cost of visiting nodes in order."""
    total = 0.0
    for i in range(len(route) - 1):
        cost = shortest_path_cost(route[i], route[i+1])
        if cost == float('inf'):
            return float('inf')
        total += cost
    return total
