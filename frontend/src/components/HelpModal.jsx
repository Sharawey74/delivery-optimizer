import React from 'react';

export default function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>🚚 Delivery Optimizer Guide</h2>
        <div className="modal-scroll-area">
          <section>
            <h3>1. The Project Idea</h3>
            <p>Welcome to the AI-Based Delivery Optimizer! This system is not a random chaotic visualizer, but a <strong>Live Adaptive Logistics Operation</strong>. Imagine you are managing "Uber for Packages" with 3 vans across a city. The AI is the brain telling them exactly where to go to minimize driving distance and save gas.</p>
          </section>

          <section>
            <h3>2. Modes of Operation</h3>
            <ul>
              <li><strong>Simulation Mode:</strong> The system runs autonomously. Orders appear randomly over time, and random disasters strike. Sit back and watch the AI handle a busy day.</li>
              <li><strong>Demo Mode:</strong> You are in complete control. The system will start smoothly, but you can manually trigger disasters (like breaking a van or closing a road) using the buttons at the top to see exactly how the AI reacts.</li>
            </ul>
          </section>

          <section>
            <h3>3. Courier Lifecycle</h3>
            <p>Couriers follow a strict operational state machine:</p>
            <ul>
              <li><span className="badge gray">IDLE</span>: Waiting at the depot.</li>
              <li><span className="badge green">ASSIGNED</span>: Received an order and planning the route.</li>
              <li><span className="badge green">MOVING</span>: Actively driving to the destination.</li>
              <li><span className="badge green">DELIVERING</span>: Dropping off the package at the node.</li>
              <li><span className="badge red">BROKEN_DOWN</span>: Vehicle engine failed. Cargo is stranded.</li>
              <li><span className="badge red">REBALANCING_LOAD</span>: Shifting packages because a van became too heavy (max 50kg).</li>
            </ul>
          </section>

          <section>
            <h3>4. How Algorithms Respond to Events</h3>
            <div className="algo-flow">
              <p><strong>📦 Event: New Order</strong> ➔ <em>Algorithm: Greedy Insertion</em> ➔ The AI tests all 3 vans and slides the new stop into the route that adds the least amount of extra driving distance.</p>
              <p><strong>🚧 Event: Road Closure</strong> ➔ <em>Algorithm: Dijkstra</em> ➔ The GPS map recalculates around the blocked street instantly, updating all active courier paths.</p>
              <p><strong>💥 Event: Courier Breakdown</strong> ➔ <em>Algorithm: Bin Packing</em> ➔ The stranded packages are distributed to the other 2 vans based on remaining weight capacity.</p>
              <p><strong>🧠 Event: 6 Seconds of Quiet Time</strong> ➔ <em>Algorithm: Dynamic Programming (DP)</em> ➔ The AI takes a deep breath, analyzes the messy "Greedy" routes, and mathematically perfects them to save maximum distance.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
