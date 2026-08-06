import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from "reactflow";

import "reactflow/dist/style.css";

import {
  FiSearch,
  FiPlus,
  FiUser,
  FiUsers,
  FiMapPin,
  FiPhone,
  FiTruck,
  FiFileText,
  FiX,
  FiTarget,
  FiDownload,
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import api from "../services/api";
import { getGraph } from "../services/graphService";
import { layoutGraph } from "../utils/layoutGraph";
import { getCases } from "../services/caseService";
import { createSuspect } from "../services/suspectService";
import { caseChat, exportCasePdf } from "../services/aiService";
/* ---------------------------------------------------------- */
/* Custom Nodes */
/* ---------------------------------------------------------- */

function SuspectNode({ data }) {
  return (
    <div className="w-56 rounded-2xl overflow-hidden border border-cyan-500 bg-slate-900 shadow-xl">

      <Handle
        type="target"
        position={Position.Top}
      />

      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3">

        <h3 className="text-white font-bold">

          👤 {data.name}

        </h3>

      </div>

      <div className="space-y-3 p-4">

        <div>

          <p className="text-xs text-slate-400">

            Risk Level

          </p>

          <span
            className={`inline-block mt-1 rounded-full px-3 py-1 text-xs

            ${
              data.risk === "Critical"
                ? "bg-red-500/20 text-red-400"

                : data.risk === "High"
                ? "bg-orange-500/20 text-orange-400"

                : data.risk === "Medium"
                ? "bg-yellow-500/20 text-yellow-300"

                : "bg-green-500/20 text-green-400"
            }`}
          >

            {data.risk}

          </span>

        </div>

        <div>

          <p className="text-xs text-slate-400">

            Linked Evidence

          </p>

          <h2 className="text-2xl font-bold text-cyan-400">

            {data.evidence}

          </h2>

        </div>

      </div>

      <Handle
        type="source"
        position={Position.Bottom}
      />

    </div>
  );
}

function EntityNode({ data }) {
  return (
    <div className="w-44 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg">

      <Handle
        type="target"
        position={Position.Top}
      />

      <div
        className="p-3 text-center font-bold text-white"
        style={{
          background: data.color,
        }}
      >

        {data.icon} {data.title}

      </div>

      <div className="p-4 text-center text-sm text-slate-300">

        {data.subtitle}

      </div>

      <Handle
        type="source"
        position={Position.Bottom}
      />

    </div>
  );
}

function CaseNode({ data }) {
  return (
    <div className="w-72 overflow-hidden rounded-2xl border border-red-500 bg-slate-900 shadow-2xl">

      <Handle
        type="source"
        position={Position.Bottom}
      />

      <div className="bg-gradient-to-r from-red-600 to-rose-600 p-3">

        <h2 className="font-bold text-white">

          {data.caseNumber}

        </h2>

      </div>

      <div className="space-y-2 p-4">

        <h3 className="font-bold text-white">

          {data.title}

        </h3>

        <p className="text-sm text-slate-400">

          Priority

        </p>

        <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-400">

          {data.priority}

        </span>

      </div>

    </div>
  );
}

/* ---------------------------------------------------------- */

const nodeTypes = {
  case: CaseNode,
  suspect: SuspectNode,
  entity: EntityNode,
};

export default function Suspects() {

  const [search, setSearch] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphSummary, setGraphSummary] = useState({ cases: 0, suspects: 0, evidence: 0, witnesses: 0 });
  const [syncing, setSyncing] = useState(false);

  const [cases, setCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [newSuspect, setNewSuspect] = useState({
    full_name: "",
    alias: "",
    nationality: "",
    risk_level: "Medium",
    status: "Under Investigation",
    notes: "",
  });

  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState("");

  const [reportLoading, setReportLoading] = useState(false);

  const rfInstance = useRef(null);

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let caseId = 1;
    try {
      const caseList = await getCases();
      setCases(caseList || []);
      if (caseList && caseList.length > 0) {
        caseId = caseList[0].id;
      }
    } catch (err) {
      console.error(err);
    }
    setActiveCaseId(caseId);
    await loadGraph(caseId);
  };

  const loadGraph = async (caseId = activeCaseId) => {
    try {
      const graph = await getGraph(caseId);
      const flowNodes = graph.nodes.map((node, index) => ({

            id: node.id,

            position: {

                x: 150 + (index % 4) * 250,

                y: 120 + Math.floor(index / 4) * 180,

            },

            data: {

                ...node.properties,

                title: node.name,

            },

            type:
                node.label === "Case"
                    ? "case"
                    : node.label === "Suspect"
                    ? "suspect"
                    : "entity",

        }));

      const flowEdges = graph.links.map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.type,
        animated: true,
      }));

      const arrangedNodes = layoutGraph(flowNodes, flowEdges);
      setNodes(arrangedNodes);
      setEdges(flowEdges);
      setGraphSummary({
        cases: graph.nodes.filter((node) => node.label === "Case").length,
        suspects: graph.nodes.filter((node) => node.label === "Suspect").length,
        evidence: graph.nodes.filter((node) => node.label === "Evidence").length,
        witnesses: graph.nodes.filter((node) => node.label === "Witness").length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const syncGraph = async () => {
    setSyncing(true);
    try {
      await api.post("/graph/sync");
      await loadGraph();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Dim nodes that don't match the search query instead of hiding them,
  // so the graph structure stays visible while the match is highlighted.
  const displayedNodes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return nodes;

    return nodes.map((node) => {
      const haystack = `${node.data?.title || ""} ${node.data?.name || ""} ${node.data?.alias || ""}`.toLowerCase();
      const match = haystack.includes(query);
      return {
        ...node,
        style: {
          ...node.style,
          opacity: match ? 1 : 0.2,
          transition: "opacity 0.2s ease",
        },
      };
    });
  }, [nodes, search]);

  const openAddSuspect = () => {
    setAddError("");
    setNewSuspect({
      full_name: "",
      alias: "",
      nationality: "",
      risk_level: "Medium",
      status: "Under Investigation",
      notes: "",
    });
    setAddModalOpen(true);
  };

  const submitAddSuspect = async (e) => {
    e.preventDefault();
    if (!newSuspect.full_name.trim()) {
      setAddError("Full name is required.");
      return;
    }
    if (!activeCaseId) {
      setAddError("No active case to attach this suspect to.");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      await createSuspect({
        case_id: activeCaseId,
        full_name: newSuspect.full_name.trim(),
        alias: newSuspect.alias.trim() || null,
        nationality: newSuspect.nationality.trim() || null,
        risk_level: newSuspect.risk_level,
        status: newSuspect.status,
        notes: newSuspect.notes.trim() || null,
      });
      setAddModalOpen(false);
      await loadGraph();
    } catch (err) {
      console.error(err);
      setAddError(
        err?.response?.data?.detail || "Failed to create suspect. Please try again."
      );
    } finally {
      setAddSaving(false);
    }
  };

  const runRelationshipAnalysis = async () => {
    if (!selectedNode || !activeCaseId) return;
    const name = selectedNode.data?.title || selectedNode.data?.name || "this entity";
    setAnalysisOpen(true);
    setAnalysisLoading(true);
    setAnalysisText("");
    try {
      const result = await caseChat(
        activeCaseId,
        `Analyze the relationships and connections of "${name}" within this case. Identify how they connect to other suspects, witnesses, evidence, and locations, and flag anything investigatively significant.`
      );
      setAnalysisText(result.answer || "No analysis returned.");
    } catch (err) {
      console.error(err);
      setAnalysisText("AI relationship analysis failed. Please try again.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!activeCaseId) return;
    setReportLoading(true);
    try {
      const blob = await exportCasePdf(activeCaseId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `case_${activeCaseId}_investigation_report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const recenterSuspectBoard = () => {
    rfInstance.current?.fitView({ padding: 0.2, duration: 400 });
  };

  return (

    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <div className="p-8">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >

            {/* Header */}

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

                  Investigation Board

                </h1>

                <p className="mt-3 text-slate-400">

                  Case Visualization • Neo4j • AI Investigation

                </p>

              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={syncGraph}
                  className="rounded-2xl border border-cyan-500 px-6 py-4 font-bold text-cyan-400 transition hover:bg-cyan-500/10"
                >
                  {syncing ? "Syncing..." : "Sync Graph"}
                </button>

                <button
                  onClick={openAddSuspect}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-bold text-white transition hover:scale-105"
                >
                  <FiPlus />
                  Add Suspect
                </button>
              </div>

            </div>

            {/* Search */}

            <div className="relative mt-8">

              <FiSearch
                className="absolute left-5 top-5 text-slate-500"
              />

              <input

                value={search}

                onChange={(e) =>
                  setSearch(e.target.value)
                }

                placeholder="Search suspects, evidence, witness..."

                className="
                w-full
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                py-5
                pl-14
                pr-6
                text-white
                outline-none
                focus:border-cyan-500"
              />

            </div>

            {/* Dashboard */}

            <div className="grid grid-cols-12 gap-6 mt-8">

              {/* LEFT PANEL */}

              <div className="col-span-3">

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

                  <div className="flex items-center gap-3">

                    <FiUsers className="text-cyan-400 text-2xl" />

                    <h2 className="text-xl font-bold text-white">

                      Investigation

                    </h2>

                  </div>

                  <div className="mt-8 space-y-4">

                    <div className="rounded-2xl bg-slate-800 p-4">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-red-400 text-xl" />
                        <div>
                          <p className="text-xs text-slate-400">Active Investigation</p>
                          <p className="text-sm text-slate-300">Case graph synchronized</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-800 p-4">

                      <div className="flex items-center gap-3">

                        <FiMapPin className="text-cyan-400 text-xl" />

                        <div>

                          <h3 className="font-semibold text-white">

                            Location

                          </h3>

                          <p className="text-sm text-slate-400">
                            {graphSummary.cases > 0 ? `${graphSummary.cases} case(s) linked` : "Awaiting sync"}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="rounded-2xl bg-slate-800 p-4">

                      <div className="flex items-center gap-3">

                        <FiPhone className="text-yellow-400 text-xl" />

                        <div>

                          <h3 className="font-semibold text-white">

                            Witnesses

                          </h3>

                          <p className="text-sm text-slate-400">
                            {graphSummary.witnesses} witness nodes
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="rounded-2xl bg-slate-800 p-4">

                      <div className="flex items-center gap-3">

                        <FiTruck className="text-purple-400 text-xl" />

                        <div>

                          <h3 className="font-semibold text-white">

                            Stolen Artworks

                          </h3>

                          <p className="text-sm text-slate-400">
                            {graphSummary.evidence} evidence nodes
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* GRAPH */}

              <div className="col-span-6">

                <div
                  className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden"
                  style={{
                    height: 760,
                  }}
                >

                  <ReactFlow

                    nodes={displayedNodes}

                    edges={edges}

                    nodeTypes={nodeTypes}

                    onNodeClick={onNodeClick}

                    onInit={(instance) => (rfInstance.current = instance)}

                    fitView

                  >

                    <MiniMap
                      zoomable
                      pannable
                    />

                    <Controls
                      showInteractive={false}
                    />

                    <Background />

                  </ReactFlow>

                </div>

              </div>
                            {/* RIGHT PANEL */}

              <div className="col-span-3">

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 h-full">

                  <h2 className="text-white text-2xl font-bold">

                    Investigation Details

                  </h2>

                  <p className="text-slate-400 mt-2">

                    Selected Node Information

                  </p>

                  {selectedNode ? (

                    <div className="mt-8 space-y-6">

                      <div>

                        <p className="text-slate-500 text-sm">

                          Node

                        </p>

                        <h3 className="text-white text-xl font-bold mt-1">

                          {selectedNode.data.title ||
                            selectedNode.data.name}

                        </h3>

                      </div>

                      {selectedNode.data.caseNumber && (

                        <div>

                          <p className="text-slate-500 text-sm">

                            Case Number

                          </p>

                          <p className="text-cyan-400">

                            {selectedNode.data.caseNumber}

                          </p>

                        </div>

                      )}

                      {selectedNode.data.priority && (

                        <div>

                          <p className="text-slate-500 text-sm">

                            Priority

                          </p>

                          <span className="rounded-full bg-red-500/20 px-3 py-1 text-red-400">

                            {selectedNode.data.priority}

                          </span>

                        </div>

                      )}

                      {selectedNode.data.subtitle && (

                        <div>

                          <p className="text-slate-500 text-sm">

                            Information

                          </p>

                          <p className="text-white">

                            {selectedNode.data.subtitle}

                          </p>

                        </div>

                      )}

                      {selectedNode.data.evidence && (

                        <div>

                          <p className="text-slate-500 text-sm">

                            Linked Evidence

                          </p>

                          <h1 className="text-4xl font-black text-cyan-400">

                            {selectedNode.data.evidence}

                          </h1>

                        </div>

                      )}

                    </div>

                  ) : (

                    <div className="mt-10">

                      <div className="rounded-2xl bg-slate-800 p-6">

                        <h3 className="text-white font-semibold">

                          Nothing Selected

                        </h3>

                        <p className="text-slate-400 mt-3">

                          Click any node in the investigation graph
                          to inspect its details.

                        </p>

                      </div>

                    </div>

                  )}

                  <div className="mt-10">

                    <button
                      onClick={runRelationshipAnalysis}
                      disabled={!selectedNode || analysisLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {analysisLoading ? "Analyzing..." : "AI Relationship Analysis"}
                    </button>

                    <button
                      onClick={downloadReport}
                      disabled={reportLoading || !activeCaseId}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 mt-3 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiDownload />
                      {reportLoading ? "Generating..." : "Generate Investigation Report"}
                    </button>

                    <button
                      onClick={recenterSuspectBoard}
                      className="w-full rounded-xl border border-purple-600 py-3 mt-3 text-purple-300 hover:bg-purple-500/10"
                    >
                      Suspect Board
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

      {/* Add Suspect Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Add Suspect</h2>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <FiX size={22} />
                </button>
              </div>

              <form onSubmit={submitAddSuspect} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-400">Full Name *</label>
                  <input
                    value={newSuspect.full_name}
                    onChange={(e) => setNewSuspect({ ...newSuspect, full_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    placeholder="George Reissfelder"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Alias</label>
                  <input
                    value={newSuspect.alias}
                    onChange={(e) => setNewSuspect({ ...newSuspect, alias: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    placeholder="The Locksmith"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Nationality</label>
                  <input
                    value={newSuspect.nationality}
                    onChange={(e) => setNewSuspect({ ...newSuspect, nationality: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    placeholder="American"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">Risk Level</label>
                    <select
                      value={newSuspect.risk_level}
                      onChange={(e) => setNewSuspect({ ...newSuspect, risk_level: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Status</label>
                    <select
                      value={newSuspect.status}
                      onChange={(e) => setNewSuspect({ ...newSuspect, status: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    >
                      <option>Under Investigation</option>
                      <option>Active</option>
                      <option>Cleared</option>
                      <option>Charged</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Notes</label>
                  <textarea
                    value={newSuspect.notes}
                    onChange={(e) => setNewSuspect({ ...newSuspect, notes: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    placeholder="Known for prior art theft connections."
                  />
                </div>

                {addError && (
                  <p className="text-sm text-red-400">{addError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="flex-1 rounded-xl border border-slate-700 py-3 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSaving}
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {addSaving ? "Saving..." : "Add Suspect"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Relationship Analysis Modal */}
      <AnimatePresence>
        {analysisOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiTarget className="text-cyan-400 text-2xl" />
                  <h2 className="text-2xl font-bold text-white">AI Relationship Analysis</h2>
                </div>
                <button
                  onClick={() => setAnalysisOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <FiX size={22} />
                </button>
              </div>

              <div className="mt-6">
                {analysisLoading ? (
                  <p className="text-slate-400">Analyzing relationships across the investigation graph...</p>
                ) : (
                  <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">{analysisText}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>

  );

}