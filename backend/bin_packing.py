from greedy import greedy_insert_order


def _make_stop(order: dict, stop_type: str) -> dict:
    """Creates a tagged route stop entry."""
    node = order["pickup_node"] if stop_type == "pickup" else order["delivery_node"]
    return {"node": node, "order_id": order["order_id"], "type": stop_type}


def check_capacity(courier: dict, new_order_weight: float) -> bool:
    """Returns True if adding new_order_weight does not exceed capacity_max."""
    return courier['capacity_used'] + new_order_weight <= courier['capacity_max']


def repack_courier(overloaded_courier: dict, all_couriers: dict) -> dict:
    """
    Called when a courier is over capacity after an order is added.
    C3: Routes are tagged dicts. Stops are removed by order_id (not node value)
    to avoid accidentally removing a stop belonging to a different order that
    shares the same node ID.
    """
    offloaded = []
    moved_to = {}

    overloaded_courier['orders'].sort(key=lambda x: x['weight'], reverse=True)

    while (
        overloaded_courier['capacity_used'] > overloaded_courier['capacity_max']
        and overloaded_courier['orders']
    ):
        order = overloaded_courier['orders'].pop()  # pop lightest (list sorted heavy→light)
        overloaded_courier['capacity_used'] -= order['weight']

        # C3: remove by order_id — safe even if two orders share a node
        overloaded_courier['route'] = [
            e for e in overloaded_courier['route']
            if e['order_id'] != order['order_id']
        ]
        offloaded.append(order)

    for order in offloaded:
        best_courier_id, best_index = greedy_insert_order(order, all_couriers)
        if best_courier_id:
            dest = all_couriers[best_courier_id]
            dest['orders'].append(order)
            dest['capacity_used'] += order['weight']
            # C3: insert tagged dict entries
            dest['route'].insert(best_index, _make_stop(order, "delivery"))
            dest['route'].insert(best_index, _make_stop(order, "pickup"))
            moved_to[order['order_id']] = best_courier_id

    return {"offloaded": offloaded, "moved_to": moved_to}


def get_cargo_manifest(courier: dict) -> dict:
    """Returns a summary of a courier's current cargo and capacity."""
    orders_summary = [
        {"order_id": o["order_id"], "weight": o["weight"]}
        for o in courier["orders"]
    ]
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
