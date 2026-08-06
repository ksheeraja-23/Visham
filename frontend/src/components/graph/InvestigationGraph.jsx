import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from "reactflow";

import "reactflow/dist/style.css";

const nodes = [
  {
    id: "1",
    position: { x: 150, y: 80 },
    data: { label: "👤 John Carter" },
    type: "default",
  },
  {
    id: "2",
    position: { x: 420, y: 220 },
    data: { label: "👤 Emily Stone" },
  },
  {
    id: "3",
    position: { x: 650, y: 80 },
    data: { label: "📷 CCTV Footage" },
  },
  {
    id: "4",
    position: { x: 420, y: 400 },
    data: { label: "🏦 Bank Account" },
  },
];

const edges = [
  {
    id: "e1",
    source: "1",
    target: "2",
    label: "Phone Calls",
    animated: true,
  },
  {
    id: "e2",
    source: "2",
    target: "3",
    label: "Seen In",
  },
  {
    id: "e3",
    source: "1",
    target: "4",
    label: "Transfers",
  },
];

export default function InvestigationGraph() {
  return (
    <div className="h-full w-full rounded-3xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}