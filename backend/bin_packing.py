from greedy import greedy_insert_order

def check_capacity(courier: dict, new_order_weight: float) -> bool:
    """Returns True if adding new_order_weight does not exceed capacity_max."""
    return courier['capacity_used'] + new_order_weight <= courier['capacity_max']

def repack_courier(overloaded_courier: dict, all_couriers: dict) -> dict:
    """
    Called when a courier is over capacity after an order is added.
    Strategy: sort the overloaded courier's orders by weight descending.
    Remove orders one by one from the END (lightest first) until the courier
    is within capacity. For each removed order, find the active courier with
    the most remaining capacity and add the order there using greedy_insert.

    Returns a dict:
      {
        "offloaded": [list of order dicts that were moved],
        "moved_to": {order_id: courier_id}
      }
    """
    offloaded = []
    moved_to = {}
    
    overloaded_courier['orders'].sort(key=lambda x: x['weight'], reverse=True)
    
    while overloaded_courier['capacity_used'] > overloaded_courier['capacity_max'] and len(overloaded_courier['orders']) > 0:
        order = overloaded_courier['orders'].pop()
        overloaded_courier['capacity_used'] -= order['weight']
        
        route = overloaded_courier['route']
        if order['pickup_node'] in route:
            route.remove(order['pickup_node'])
        if order['delivery_node'] in route:
            route.remove(order['delivery_node'])
            
        offloaded.append(order)
        
    for order in offloaded:
        best_courier_id, best_index = greedy_insert_order(order, all_couriers)
        if best_courier_id:
            dest_courier = all_couriers[best_courier_id]
            dest_courier['orders'].append(order)
            dest_courier['capacity_used'] += order['weight']
            dest_courier['route'].insert(best_index, order['delivery_node'])
            dest_courier['route'].insert(best_index, order['pickup_node'])
            moved_to[order['order_id']] = best_courier_id

    return {
        "offloaded": offloaded,
        "moved_to": moved_to
    }

def get_cargo_manifest(courier: dict) -> dict:
    """
    Returns:
      {
        "courier_id": str,
        "orders": [list of order summaries],
        "capacity_used": float,
        "capacity_max": float,
        "utilization_pct": float
      }
    """
    orders_summary = [{"order_id": o["order_id"], "weight": o["weight"]} for o in courier["orders"]]
    utilization = 0.0
    if courier["capacity_max"] > 0:
        utilization = (courier["capacity_used"] / courier["capacity_max"]) * 100
        
    return {
        "courier_id": courier["id"],
        "orders": orders_summary,
        "capacity_used": courier["capacity_used"],
        "capacity_max": courier["capacity_max"],
        "utilization_pct": round(utilization, 2)
    }
