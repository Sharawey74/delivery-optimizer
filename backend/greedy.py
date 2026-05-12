from graph import get_route_cost


def greedy_insert_order(order: dict, couriers: dict) -> tuple[str, int]:
    """
    Tries inserting 'order' at every position in every active courier's route.
    Order dict has keys: order_id, pickup_node, delivery_node, weight.

    C3: Routes are now lists of tagged dicts {"node": int, "order_id": str, "type": str}.
    Cost calculation extracts node IDs before passing to get_route_cost.

    Returns (best_courier_id, best_insertion_index) that minimizes insertion cost,
    considering only couriers with enough remaining capacity.
    If no courier has capacity, returns (None, None).
    """
    best_courier_id = None
    best_index = None
    min_cost = float('inf')

    for cid, courier in couriers.items():
        if not courier.get('active', False):
            continue

        if courier['capacity_max'] - courier['capacity_used'] < order['weight']:
            continue

        # C3: extract node IDs from tagged route entries
        current_route_nodes = [e["node"] for e in courier['route']]
        current_full_nodes = [courier['position']] + current_route_nodes
        current_cost = get_route_cost(current_full_nodes)

        for i in range(len(current_route_nodes) + 1):
            new_nodes = (
                current_route_nodes[:i]
                + [order['pickup_node'], order['delivery_node']]
                + current_route_nodes[i:]
            )
            new_full_nodes = [courier['position']] + new_nodes
            cost = get_route_cost(new_full_nodes)
            insertion_cost = cost - current_cost

            if insertion_cost < min_cost:
                min_cost = insertion_cost
                best_courier_id = cid
                best_index = i

    return best_courier_id, best_index
