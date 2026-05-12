import React, { useState } from 'react';

export default function EventLog({ events }) {
  const [activeTab, setActiveTab] = useState('operational');

  // Filter events based on their category (fallback to operational if missing for old state)
  const filteredEvents = events.filter(e => {
    const cat = e.category || 'operational';
    return cat === activeTab;
  });

  return (
    <div className="panel event-log">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>System Logs</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`tab-btn ${activeTab === 'operational' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('operational')}
          >
            Operations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'disruption' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('disruption')}
          >
            Disruptions
          </button>
        </div>
      </div>
      
      <div className="log-list">
        {filteredEvents.length === 0 ? (
          <div style={{ color: 'var(--on-surface-variant)', fontSize: '13px', fontStyle: 'italic', padding: '10px' }}>
            No {activeTab} events yet.
          </div>
        ) : (
          filteredEvents.map((evt, idx) => (
            <div key={idx} className={`log-item ${evt.type}`}>
              <div className="log-header">
                <span className="log-tick">[{evt.tick}s]</span>
                <span className="log-type">{evt.type.toUpperCase().replace(/_/g, ' ')}</span>
              </div>
              <div className="log-desc">{evt.description}</div>
              <div className="log-algo">
                Algorithm: {evt.algorithm} 
                {evt.quality_delta ? ` (${evt.quality_delta > 0 ? '+' : ''}${evt.quality_delta.toFixed(1)}km)` : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
