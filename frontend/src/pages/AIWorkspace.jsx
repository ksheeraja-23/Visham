import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  BrainCircuit,
  Send,
  Sparkles,
  FileText,
  ShieldAlert,
  Search,
} from "lucide-react";

export default function AIWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const evidence = location.state?.evidence || [];
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [caseId, setCaseId] = useState(location.state?.caseId || evidence[0]?.case_id || 1);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hello Investigator. Ask me anything about your investigations.",
    },
  ]);

  useEffect(() => {
    if (evidence.length > 0) {
      setCaseId(evidence[0]?.case_id || caseId);
      setMessages([
        {
          role: "assistant",
          text: `Loaded ${evidence.length} evidence file(s).\n\nHow would you like me to analyze them?`,
        },
      ]);
    }
  }, [evidence]);

  async function exportPdf() {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const response = await api.get(`/ai/case/${caseId}/export-pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `case_${caseId}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingPdf(false);
    }
  }

  async function askAI(customQuestion = question) {
    const prompt = (customQuestion || question).trim();
    if (loading || !prompt) return;

    const userMessage = {
      role: "user",
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await api.post(`/ai/case/${caseId}/chat`, { question: prompt });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response.data.answer || response.data.response || "No response received.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err.response?.data?.detail || err.message || "❌ AI server is unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (

    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-10">

          <div className="flex justify-between items-center">

            <div>

              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">

                AI Investigation Workspace

              </h1>

              <p className="text-slate-400 mt-3">

                Analyze cases using AI.

              </p>

            </div>

            <div className="flex gap-4 items-center">

  <input
    value={caseId}
    onChange={(e) => setCaseId(e.target.value)}
    className="w-24 rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-white"
    type="number"
    min="1"
  />

  <button
    onClick={() =>
      setMessages([
        {
          role: "assistant",
          text: "👋 Hello Investigator. Ask me anything about your investigations.",
        },
      ])
    }
    className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
  >
    Clear Chat
  </button>

  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6">
    <BrainCircuit
      size={40}
      className="text-white"
    />
  </div>

</div>

          </div>

          <div className="grid grid-cols-4 gap-6 mt-8">

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >

              <Sparkles className="text-cyan-400"/>

              <h2 className="text-white text-xl mt-4">

                AI Summary

              </h2>

              <p className="text-slate-400 mt-2">

                Generate complete investigation summaries.

              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >

              <Search className="text-green-400"/>

              <h2 className="text-white text-xl mt-4">

                Similar Cases

              </h2>

              <p className="text-slate-400 mt-2">

                Search historical investigations.

              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >

              <ShieldAlert className="text-red-400"/>

              <h2 className="text-white text-xl mt-4">

                Risk Analysis

              </h2>

              <p className="text-slate-400 mt-2">

                Detect suspicious patterns.

              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >

              <FileText className="text-yellow-400"/>

              <h2 className="text-white text-xl mt-4">

                AI Reports

              </h2>

              <p className="text-slate-400 mt-2">

                Export investigation reports.

              </p>

            </motion.div>

          </div>

          <div className="mt-10 rounded-3xl bg-slate-900 border border-slate-800 h-[600px] flex flex-col">

            <div className="flex-1 overflow-auto p-6 space-y-5">

              {messages.map((msg, index) => (
                <motion.div

                  key={index}

                  initial={{
                    opacity:0,
                    y:20
                  }}

                  animate={{
                    opacity:1,
                    y:0
                  }}

                  className={`max-w-[75%] rounded-2xl p-5 ${
                    msg.role === "assistant"
                      ? "bg-slate-800 text-white"
                      : "bg-blue-600 ml-auto text-white"
                  }`}

                >

                  <p className="whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>

                </motion.div>

              ))}

              {loading && (
                <motion.div

                  animate={{
                    opacity:[0.5,1,0.5]
                  }}

                  transition={{
                    repeat:Infinity,
                    duration:1
                  }}

                  className="bg-slate-800 rounded-2xl p-5 text-white w-fit"

                >

                  AI is thinking...

                </motion.div>

              )}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="border-t border-slate-800 p-6">

              <div className="grid grid-cols-4 gap-4 mb-6">

                <button
                  onClick={() => askAI("Generate investigation summary")}
                  className="rounded-2xl bg-slate-800 hover:bg-slate-700 transition p-4 text-white font-semibold"
                >
                  📄 Summary
                </button>

                <button
                  onClick={() => askAI("Find contradictions in this case")}
                  className="rounded-2xl bg-slate-800 hover:bg-slate-700 transition p-4 text-white font-semibold"
                >
                  🔍 Contradictions
                </button>

                <button
                  onClick={() => askAI("Suggest next investigation steps")}
                  className="rounded-2xl bg-slate-800 hover:bg-slate-700 transition p-4 text-white font-semibold"
                >
                  🚔 Next Steps
                </button>

                <button
                  onClick={() => askAI("Generate complete investigation report")}
                  className="rounded-2xl bg-slate-800 hover:bg-slate-700 transition p-4 text-white font-semibold"
                >
                  🤖 Full Report
                </button>

              </div>

              <div className="flex gap-4">

                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      askAI();
                    }
                  }}
                  placeholder="Ask AI anything about your investigation..."
                  className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 px-5 py-4 text-white outline-none focus:border-cyan-500"
                />

                <motion.button
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    disabled={loading}
                    onClick={() => askAI(question)}
                    className={`rounded-2xl px-8 text-white font-bold transition-all ${
                        loading
                        ? "bg-slate-700 cursor-not-allowed opacity-70"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30"
  }`}
>
  {loading ? "..." : <Send size={22} />}
</motion.button>

              </div>

            </div>

          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .3 }}
            className="mt-8 rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-8"
          >

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-3xl font-bold text-white">

                  AI Investigation Engine

                </h2>

                <p className="text-blue-100 mt-3">

                  Generate reports, analyze evidence, detect contradictions,
                  summarize witness statements and recommend investigation steps.

                </p>

              </div>

              <BrainCircuit
                size={70}
                className="text-white"
              />

            </div>

            <div className="grid grid-cols-4 gap-5 mt-8">

              <button
                onClick={exportPdf}
                disabled={exportingPdf}
                className="rounded-2xl bg-white/10 hover:bg-white/20 transition py-5 text-white font-semibold disabled:opacity-50"
              >

                {exportingPdf ? "Exporting..." : "📄 Export PDF"}

              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-2xl bg-white/10 hover:bg-white/20 transition py-5 text-white font-semibold"
              >

                📊 Generate Charts

              </button>

              <button
                onClick={() => askAI("Summarize the case timeline in chronological order, highlighting key events.")}
                className="rounded-2xl bg-white/10 hover:bg-white/20 transition py-5 text-white font-semibold"
              >

                📑 Case Timeline

              </button>

              <button
                onClick={() => askAI("Perform a full AI analysis of this case: summary, evidence analysis, entity extraction, contradictions, risk analysis, and next-step suggestions.")}
                className="rounded-2xl bg-white/10 hover:bg-white/20 transition py-5 text-white font-semibold"
              >

                🧠 Full AI Analysis

              </button>

            </div>

          </motion.div>

        </main>

      </div>

    </div>

  );

}