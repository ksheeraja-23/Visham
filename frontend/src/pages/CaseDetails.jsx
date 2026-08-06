import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiUser,
  FiUsers,
  FiMapPin,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

const defaultCase = {
  case_number: "",
  title: "Loading case",
  description: "",
  status: "Open",
  priority: "Medium",
  location: "",
  incident_date: "",
  created_by: "Admin",
};

export default function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeCaseId = Number(caseId || location.state?.caseId || 1);

  const [caseData, setCaseData] = useState(defaultCase);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [witnesses, setWitnesses] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [aiSummary, setAiSummary] = useState("Generate an AI summary for this case.");
  const [riskAnalysis, setRiskAnalysis] = useState("Run a risk review to surface concerns.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaseData();
  }, [activeCaseId]);

  async function loadCaseData() {
    setLoading(true);
    try {
      const [caseRes, evidenceRes, suspectRes, witnessRes, timelineRes] = await Promise.all([
        api.get(`/cases/${activeCaseId}`),
        api.get(`/evidence/case/${activeCaseId}`),
        api.get(`/suspects/case/${activeCaseId}`),
        api.get(`/witnesses/case/${activeCaseId}`),
        api.get(`/timeline/case/${activeCaseId}`),
      ]);

      setCaseData(caseRes.data || defaultCase);
      setEvidenceItems(Array.isArray(evidenceRes.data) ? evidenceRes.data : []);
      setSuspects(Array.isArray(suspectRes.data) ? suspectRes.data : []);
      setWitnesses(Array.isArray(witnessRes.data) ? witnessRes.data : []);
      setTimelineEvents(Array.isArray(timelineRes.data) ? timelineRes.data : []);

      try {
        const summaryRes = await api.post(`/ai/case/${activeCaseId}/summarize`);
        setAiSummary(summaryRes.data.summary || summaryRes.data.report || "No summary returned.");
      } catch (err) {
        console.error(err);
      }

      try {
        const riskRes = await api.post(`/ai/case/${activeCaseId}/risk-analysis`);
        setRiskAnalysis(riskRes.data.risk_analysis || "No risk analysis returned.");
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function runAiAction(endpoint, setter) {
    try {
      const response = await api.post(`/ai/case/${activeCaseId}/${endpoint}`);
      const value = response.data.summary || response.data.risk_analysis || response.data.contradictions || response.data.report || "No result returned.";
      setter(value);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading case details...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4">
                <FiArrowLeft />
                Back to Dashboard
              </button>

              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Case #{caseData.case_number || activeCaseId}
              </h1>

              <p className="text-slate-400 mt-3 text-lg">{caseData.title}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/cases")}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-white font-semibold"
            >
              <FiEdit />
              Edit Case
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <FiCheckCircle className="text-green-400 text-3xl" />
              <h3 className="text-slate-400 mt-4">Status</h3>
              <p className="text-2xl text-white font-bold mt-2">{caseData.status}</p>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <FiAlertTriangle className="text-red-400 text-3xl" />
              <h3 className="text-slate-400 mt-4">Priority</h3>
              <p className="text-2xl text-white font-bold mt-2">{caseData.priority}</p>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <FiUser className="text-cyan-400 text-3xl" />
              <h3 className="text-slate-400 mt-4">Assigned Officer</h3>
              <p className="text-2xl text-white font-bold mt-2">{caseData.created_by}</p>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <FiCalendar className="text-yellow-400 text-3xl" />
              <h3 className="text-slate-400 mt-4">Date Opened</h3>
              <p className="text-2xl text-white font-bold mt-2">{caseData.incident_date || "Pending"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8">
              <h2 className="text-3xl font-bold text-white">Case Description</h2>
              <p className="text-slate-400 mt-6 leading-8">{caseData.description || "No description yet."}</p>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <h3 className="text-slate-500">Crime Type</h3>
                  <p className="text-white mt-2">{caseData.title}</p>
                </div>
                <div>
                  <h3 className="text-slate-500">Location</h3>
                  <p className="text-white mt-2 flex items-center gap-2"><FiMapPin />{caseData.location || "Pending"}</p>
                </div>
                <div>
                  <h3 className="text-slate-500">Case Number</h3>
                  <p className="text-white mt-2">{caseData.case_number || activeCaseId}</p>
                </div>
                <div>
                  <h3 className="text-slate-500">Evidence Count</h3>
                  <p className="text-white mt-2">{evidenceItems.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 p-8">
              <h2 className="text-3xl font-bold text-white">AI Summary</h2>
              <p className="text-blue-100 mt-6 leading-8">{aiSummary}</p>
              <div className="mt-8 space-y-4">
                <div className="flex justify-between">
                  <span className="text-blue-100">Risk Review</span>
                  <span className="text-white font-bold">{riskAnalysis.slice(0, 20)}{riskAnalysis.length > 20 ? "..." : ""}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-slate-900 border border-slate-800 p-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Evidence</h2>
                <button onClick={() => navigate("/evidence")} className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2 text-white">+ Add Evidence</button>
              </div>
              <div className="space-y-5 mt-8">
                {evidenceItems.length === 0 ? (
                  <p className="text-slate-400">No evidence linked to this case yet.</p>
                ) : evidenceItems.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-800 p-5 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <p className="text-slate-400 mt-1">{item.description || "Uploaded evidence"}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">{item.evidence_type}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl bg-slate-900 border border-slate-800 p-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Suspects</h2>
                <button onClick={() => navigate("/suspects")} className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2 text-white">+ Add Suspect</button>
              </div>
              <div className="space-y-5 mt-8">
                {suspects.length === 0 ? (
                  <p className="text-slate-400">No suspects linked to this case yet.</p>
                ) : suspects.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-800 p-5">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{item.full_name}</h3>
                        <p className="text-slate-400">{item.alias || "Known associate"}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400">{item.risk_level || item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-slate-900 border border-slate-800 p-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Witnesses</h2>
                <button onClick={() => navigate("/suspects")} className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2 text-white">+ Add Witness</button>
              </div>
              <div className="space-y-5 mt-8">
                {witnesses.length === 0 ? (
                  <p className="text-slate-400">No witnesses linked to this case yet.</p>
                ) : witnesses.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-800 p-5">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{item.full_name}</h3>
                        <p className="text-slate-400">{item.status}</p>
                      </div>
                      <span className="text-green-400">{item.credibility}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl bg-slate-900 border border-slate-800 p-8">
              <h2 className="text-3xl font-bold text-white">Investigation Notes</h2>
              <textarea rows={10} placeholder="Write investigation notes..." className="mt-6 w-full rounded-2xl bg-slate-800 border border-slate-700 p-5 text-white outline-none focus:border-cyan-500 resize-none" />
              <button className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-white font-semibold">Save Notes</button>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
            <button onClick={() => runAiAction("summarize", setAiSummary)} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white hover:bg-slate-800 transition">
              🧠
              <h3 className="mt-4 font-bold">AI Summary</h3>
            </button>
            <button onClick={() => runAiAction("contradictions", setAiSummary)} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white hover:bg-slate-800 transition">
              🔍
              <h3 className="mt-4 font-bold">Find Contradictions</h3>
            </button>
            <button onClick={() => runAiAction("risk-analysis", setRiskAnalysis)} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white hover:bg-slate-800 transition">
              ⚠️
              <h3 className="mt-4 font-bold">Risk Analysis</h3>
            </button>
            <button onClick={() => runAiAction("report", setAiSummary)} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white hover:bg-slate-800 transition">
              📄
              <h3 className="mt-4 font-bold">Generate Report</h3>
            </button>
          </div>

          <div className="mt-10 rounded-3xl bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Investigation Timeline</h2>
            <div className="space-y-8">
              {timelineEvents.length === 0 ? (
                <p className="text-slate-400">No timeline events have been recorded for this case.</p>
              ) : timelineEvents.map((event, index) => (
                <div key={event.id} className={`border-l-4 ${index % 2 === 0 ? "border-cyan-500" : "border-green-500"} pl-6`}>
                  <h3 className="text-white font-bold">{event.title}</h3>
                  <p className="text-slate-400">{event.event_time || event.created_at || "Recorded"} • {event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}