import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, Marker } from 'react-leaflet';
import L from 'leaflet';

// Create a custom icon for pulsing orders
const createPulsingIcon = () => {
  return L.divIcon({
    className: 'pulsing-icon',
    html: '<div class="pulse"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const createNumberedIcon = (num, color) => {
  return L.divIcon({
    className: 'numbered-icon',
    html: `<div style="background-color: var(--surface-container); border: 2px solid ${color}; color: var(--on-surface); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; font-family: 'JetBrains Mono', monospace;">${num}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createCourierIcon = (color, isActive) => {
  return L.divIcon({
    className: `courier-icon ${isActive ? 'active' : 'broken'}`,
    html: `<div style="background-color: ${isActive ? color : 'var(--error)'}; border: 2px solid var(--surface); width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 0 10px ${isActive ? color : 'var(--error)'};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function Map({ state, nodes, edges }) {
  const [pulsingIcon, setPulsingIcon] = useState(null);

  useEffect(() => {
    setPulsingIcon(createPulsingIcon());
  }, []);

  if (!nodes || !edges) return <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}>Loading Map...</div>;

  const nodeMap = {};
  nodes.forEach(n => {
    nodeMap[n.id] = [n.lat, n.lng];
  });

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={[30.045, 31.24]} zoom={14} style={{ height: '100%', width: '100%', backgroundColor: 'var(--surface)' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />
        
        {/* Edges */}
        {edges.map((e, i) => {
          const u = nodeMap[e.u];
          const v = nodeMap[e.v];
          if (!u || !v) return null;
          
          return (
            <Polyline
              key={`edge-${i}`}
              positions={[u, v]}
              color={e.closed ? 'var(--error)' : 'var(--outline-variant)'}
              weight={e.closed ? 3 : 1}
              opacity={e.closed ? 0.8 : 0.4}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => (
          <CircleMarker
            key={`node-${n.id}`}
            center={[n.lat, n.lng]}
            radius={4}
            color="transparent"
            fillColor="var(--outline)"
            fillOpacity={0.8}
          />
        ))}

        {/* State elements */}
        {state && (
          <>
            {/* Courier Routes and Stops */}
            {Object.values(state.couriers).filter(c => c.active).map(c => {
              if (c.route.length === 0) return null;
              
              const positions = [
                nodeMap[c.position],
                ...c.route.map(nodeId => nodeMap[nodeId])
              ].filter(Boolean);
              
              return (
                <div key={`route-wrapper-${c.id}`}>
                  <Polyline
                    positions={positions}
                    color={c.color}
                    weight={3}
                    opacity={0.8}
                    dashArray="5, 8"
                  />
                  {c.route.map((nodeId, index) => {
                    const pos = nodeMap[nodeId];
                    if (!pos) return null;
                    return (
                      <Marker 
                        key={`stop-${c.id}-${index}`} 
                        position={pos} 
                        icon={createNumberedIcon(index + 1, c.color)}
                        zIndexOffset={100}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Couriers */}
            {Object.values(state.couriers).map(c => {
              const pos = nodeMap[c.position];
              if (!pos) return null;
              return (
                <Marker
                  key={`courier-${c.id}`}
                  position={pos}
                  icon={createCourierIcon(c.color, c.active)}
                  zIndexOffset={1000}
                >
                  <Tooltip>{c.name} ({c.status})</Tooltip>
                </Marker>
              );
            })}

            {/* Pending Orders (Pulsing) */}
            {pulsingIcon && Object.values(state.orders).map(order => {
              let isPending = false;
              for (const cid in state.couriers) {
                if (state.couriers[cid].orders.find(o => o.order_id === order.order_id)) {
                  isPending = true;
                  break;
                }
              }
              
              if (!isPending) return null;
              
              const pos = nodeMap[order.delivery_node];
              if (!pos) return null;
              
              return (
                <Marker key={`order-${order.order_id}`} position={pos} icon={pulsingIcon}>
                  <Tooltip>{order.order_id}</Tooltip>
                </Marker>
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
}
