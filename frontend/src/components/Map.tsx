// frontend/src/components/Map.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon } from 'lucide-react';
import { Courier, MapNode, MapEdge } from '../types';

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // A generic ResizeObserver to catch any container size changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(map.getContainer());
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

// Override default icon since standard Leaflet marker icon fails to load via CSS paths in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  couriers: Record<string, Courier>;
}

export function Map({ couriers }: MapProps) {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<MapEdge[]>([]);

  useEffect(() => {
    fetch('/api/map')
      .then(r => r.json())
      .then(data => {
        setNodes(data.nodes);
        setEdges(data.edges);
      });
  }, []);

  if (nodes.length === 0) return (
    <div className="bg-brand-surface-raised border border-brand-surface-border rounded-xl h-[400px] flex items-center justify-center">
      <span className="text-brand-text-muted font-mono animate-pulse">Loading map data...</span>
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden border border-brand-surface-border shadow-xl shadow-black/40 flex flex-col">
      <div className="bg-brand-surface-raised border-b border-brand-surface-border px-4 py-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <MapIcon size={15} className="text-brand-indigo-bright" />
          Live Operations Map
        </span>
        <span className="text-xs font-mono text-brand-text-muted">
          Cairo Metropolitan Grid · {nodes.length} Nodes
        </span>
      </div>
      
      <div className="w-full h-[400px]">
        <MapContainer center={[30.0444, 31.2357]} zoom={13} style={{ height: '100%', width: '100%', background: 'var(--surface-container)' }}>
          <MapResizer />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {edges.map((edge, i) => {
            const u = nodes.find(n => n.id === edge.u);
            const v = nodes.find(n => n.id === edge.v);
            if (!u || !v) return null;
            return (
              <Polyline 
                key={`edge-${i}`} 
                positions={[[u.lat, u.lng], [v.lat, v.lng]]} 
                color={edge.closed ? 'var(--error)' : 'var(--outline-variant)'} 
                weight={edge.closed ? 4 : 2}
                dashArray={edge.closed ? '5, 5' : ''}
              />
            );
          })}

          {/* Draw Courier Routes */}
          {Object.values(couriers).map(courier => {
            if (!courier.active || !courier.route || courier.route.length === 0) return null;
            const positions: [number, number][] = [];
            
            // Add current position to connect the courier to its destination path
            const posNode = nodes.find(n => n.id === courier.position);
            if (posNode) positions.push([posNode.lat, posNode.lng]);

            // C3: route is now RouteEntry[], extract .node from each entry
            courier.route.forEach(entry => {
              const n = nodes.find(n => n.id === entry.node);
              if (n) positions.push([n.lat, n.lng]);
            });
            
            // Stop drawing if we don't have at least a line segment
            if (positions.length < 2) return null;

            return (
              <React.Fragment key={`route-wrapper-${courier.id}`}>
                <Polyline
                  positions={positions}
                  color={courier.color}
                  weight={3}
                  dashArray="10, 10"
                  opacity={0.8}
                />
                <CircleMarker
                  center={positions[positions.length - 1]}
                  radius={6}
                  color={courier.color}
                  fillColor={courier.color}
                  fillOpacity={0.5}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <span className="font-mono">{courier.id}'s Next Destination</span>
                  </Tooltip>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {nodes.map(node => (
            <CircleMarker 
              key={`node-${node.id}`} 
              center={[node.lat, node.lng]} 
              radius={4} 
              color="var(--outline-variant)"
              fillColor="var(--surface-container)"
              fillOpacity={1}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <span className="font-mono">Node {node.id}</span>
              </Tooltip>
            </CircleMarker>
          ))}

          {Object.values(couriers).map(courier => {
            if (!courier.active) return null;
            const node = nodes.find(n => n.id === courier.position);
            if (!node) return null;

            const iconSvg = `
              <div style="background-color: ${courier.color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #000; box-shadow: 0 0 10px ${courier.color}80; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: bold; font-family: monospace;">
                ${courier.id.replace('C', '')}
              </div>
            `;

            const icon = L.divIcon({
              className: 'custom-courier-icon',
              html: iconSvg,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            return (
              <Marker key={`courier-${courier.id}`} position={[node.lat, node.lng]} icon={icon}>
                <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                  <div className="font-mono text-xs">
                    <strong>{courier.name}</strong><br/>
                    Status: {courier.status}<br/>
                    Load: {courier.capacity_used.toFixed(1)} / {courier.capacity_max}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}