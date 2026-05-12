from graph import get_route_cost

def greedy_insert_order(order: dict, couriers: dict) -> tuple[str, int]:
    """
    Tries inserting 'order' at every position in every active courier's route.
    Order dict has keys: order_id, pickup_node, delivery_node, weight.

    For each courier C with route R = [n0, n1, ..., nk]:
      For each insertion index i in 0..len(R):
        New route = R[:i] + [order['pickup_node'], order['delivery_node']] + R[i:]
        Insertion cost = get_route_cost(new_route) - get_route_cost(R)

    Returns (best_courier_id, best_insertion_index) that minimizes insertion cost,
    considering only couriers with enough remaining capacity:
      courier['capacity_max'] - courier['capacity_used'] >= order['weight']

    If no courier has capacity, return (None, None).
    """
    best_courier_id = None
    best_index = None
    min_cost = float('inf')

    for cid, courier in couriers.items():
        if not courier.get('active', False):
            continue
            
        if courier['capacity_max'] - courier['capacity_used'] < order['weight']:
            continue
            
        current_route = courier['route']
        current_full_route = [courier['position']] + current_route
        current_cost = get_route_cost(current_full_route)
        
        for i in range(len(current_route) + 1):
            new_route = current_route[:i] + [order['pickup_node'], order['delivery_node']] + current_route[i:]
            new_full_route = [courier['position']] + new_route
            
            cost = get_route_cost(new_full_route)
            insertion_cost = cost - current_cost
            
            if insertion_cost < min_cost:
                min_cost = insertion_cost
                best_courier_id = cid
                best_index = i
                
    return best_courier_id, best_index
