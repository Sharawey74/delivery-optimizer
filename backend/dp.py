import time
from graph import shortest_path_cost

def dp_optimize_route(
    start_node: int,
    stops: list[int],
    time_budget_ms: float = 200.0
) -> tuple[list[int], float]:
    """
    Given a courier at start_node with a list of remaining stops to visit,
    find the optimal visiting order using DP (bitmask TSP variant).

    SCOPE LIMIT: If len(stops) > 8, truncate to first 8 stops (performance cap).

    DP formulation:
      state: (visited_bitmask, last_node)
      dp[mask][i] = min cost to have visited exactly the nodes in mask,
                    ending at stops[i]
      Transition: dp[mask | (1 << j)][j] = dp[mask][i] + cost(stops[i], stops[j])
      Base case: dp[1 << i][i] = cost(start_node, stops[i])

    TIME BUDGET: Check elapsed time after each mask iteration. If elapsed >
    time_budget_ms milliseconds, stop and return the best complete solution
    found so far. If no complete solution found yet, return the original stop
    order with its cost.

    Returns: (optimized_stop_order: list[int], total_cost: float)

    Use graph.shortest_path_cost(u, v) for all distance lookups.
    """
    if not stops:
        return [], 0.0

    original_stops = stops
    if len(stops) > 8:
        stops = stops[:8]

    n = len(stops)
    
    orig_cost = 0.0
    curr = start_node
    for s in original_stops:
        orig_cost += shortest_path_cost(curr, s)
        curr = s

    start_time = time.time()
    
    dp = {}
    parent = {}

    for i in range(n):
        mask = 1 << i
        cost = shortest_path_cost(start_node, stops[i])
        dp[(mask, i)] = cost
        parent[(mask, i)] = None
        
    best_complete_cost = float('inf')
    best_last_node_idx = -1

    for mask in range(1, 1 << n):
        if (time.time() - start_time) * 1000 > time_budget_ms:
            break
            
        for i in range(n):
            if not (mask & (1 << i)):
                continue
                
            if (mask, i) not in dp:
                continue
                
            current_cost = dp[(mask, i)]
            
            if mask == (1 << n) - 1:
                if current_cost < best_complete_cost:
                    best_complete_cost = current_cost
                    best_last_node_idx = i
                continue
                
            for j in range(n):
                if mask & (1 << j):
                    continue
                    
                next_mask = mask | (1 << j)
                transition_cost = shortest_path_cost(stops[i], stops[j])
                new_cost = current_cost + transition_cost
                
                if (next_mask, j) not in dp or new_cost < dp[(next_mask, j)]:
                    dp[(next_mask, j)] = new_cost
                    parent[(next_mask, j)] = i

    if best_complete_cost == float('inf'):
        return original_stops, orig_cost

    curr_mask = (1 << n) - 1
    curr_last = best_last_node_idx
    opt_stops_rev = []
    
    while curr_last is not None:
        opt_stops_rev.append(stops[curr_last])
        prev_last = parent[(curr_mask, curr_last)]
        curr_mask = curr_mask ^ (1 << curr_last)
        curr_last = prev_last
        
    optimized_stops = opt_stops_rev[::-1]
    
    if len(original_stops) > 8:
        optimized_stops.extend(original_stops[8:])
        total_cost = best_complete_cost
        curr = optimized_stops[7]
        for s in original_stops[8:]:
            total_cost += shortest_path_cost(curr, s)
            curr = s
        return optimized_stops, total_cost
        
    return optimized_stops, best_complete_cost
