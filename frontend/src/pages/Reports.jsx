import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiPrinter,
  FiFileText,
  FiSearch,
  FiFilter,
  FiEye,
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const response = await api.get("/cases");
      const cases = Array.isArray(response.data) ? response.data : [];
      const mapped = cases.map((item) => ({
        id: item.id,
        caseId: item.id,
        case: item.title,
        officer: item.created_by || "System",
        date: item.created_at?.slice(0, 10) || "Pending",
        status: item.status === "Closed" ? "Completed" : "Pending",
        summary: item.description || "No summary generated yet.",
      }));
      setReports(mapped);
      setSelectedReport(mapped[0] || null);
    } catch (err) {
      console.error(err);
    }
  }

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase();
    return reports.filter((report) =>
      report.case.toLowerCase().includes(query) ||
      report.officer.toLowerCase().includes(query) ||
      report.id.toString().includes(query)
    );
  }, [reports, search]);

  async function generateReport(report) {
    setLoading(true);
    try {
      const response = await api.post(`/ai/case/${report.caseId}/report`);
      const updated = reports.map((item) =>
        item.id === report.id
          ? { ...item, status: "Completed", summary: response.data.report || item.summary }
          : item
      );
      setReports(updated);
      setSelectedReport(updated.find((item) => item.id === report.id) || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function downloadReport(report, type) {
    window.open(`http://localhost:8000/api/ai/case/${report.caseId}/export-${type}`, "_blank");
  }

  return (

    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-8">

          {/* Header */}

          <div className="flex justify-between items-center mb-10">

            <div>

              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">

                Investigation Reports

              </h1>

              <p className="text-slate-400 mt-3 text-lg">

                Generate, preview and export investigation reports.

              </p>

            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: .95 }}
              onClick={() => selectedReport && generateReport(selectedReport)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-white font-semibold"
            >

              <FiFileText />

              Generate Report

            </motion.button>

          </div>

          {/* Search */}

          <div className="flex gap-4 mb-10">

            <div className="flex-1 relative">

              <FiSearch className="absolute left-5 top-4 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="w-full rounded-2xl bg-slate-900 border border-slate-800 py-4 pl-14 pr-4 text-white outline-none focus:border-cyan-500"
              />

            </div>

            <button className="rounded-2xl bg-slate-900 border border-slate-800 px-6 text-white">

              <FiFilter />

            </button>

          </div>

          {/* Reports Table */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden"
          >

            <table className="w-full">

              <thead className="bg-slate-800">

                <tr>

                  <th className="text-left p-5 text-slate-300">
                    Report ID
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Case
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Officer
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Date
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Status
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredReports.map((report) => (

                  <tr
                    key={report.id}
                    className="border-t border-slate-800 hover:bg-slate-800 transition"
                  >

                    <td className="p-5 text-cyan-400 font-semibold">
                      {report.id}
                    </td>

                    <td className="p-5 text-white">
                      {report.case}
                    </td>

                    <td className="p-5 text-slate-300">
                      {report.officer}
                    </td>

                    <td className="p-5 text-slate-300">
                      {report.date}
                    </td>

                    <td className="p-5">

                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          report.status === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {report.status}
                      </span>

                    </td>

                    <td className="p-5">

                      <div className="flex gap-3">

                        <button onClick={() => setSelectedReport(report)} className="rounded-xl bg-cyan-600 hover:bg-cyan-700 p-3 text-white">

                          <FiEye />

                        </button>

                        <button onClick={() => downloadReport(report, "pdf")} className="rounded-xl bg-green-600 hover:bg-green-700 p-3 text-white">

                          <FiDownload />

                        </button>

                        <button onClick={() => downloadReport(report, "docx")} className="rounded-xl bg-purple-600 hover:bg-purple-700 p-3 text-white">

                          <FiPrinter />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </motion.div>

          {/* Report Preview */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">

            {/* Preview */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="xl:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8"
            >

              <h2 className="text-3xl font-bold text-white">
                Report Preview
              </h2>

              <div className="mt-8 rounded-2xl bg-slate-800 p-8">

                <h3 className="text-2xl font-bold text-white">
                  {selectedReport?.case || "Select a report"}
                </h3>

                <p className="text-slate-400 mt-2">
                  Report ID : {selectedReport?.id || "N/A"}
                </p>

                <div className="grid grid-cols-2 gap-6 mt-8">

                  <div>

                    <h4 className="text-slate-500">
                      Investigating Officer
                    </h4>

                    <p className="text-white mt-2">
                      {selectedReport?.officer || "System"}
                    </p>

                  </div>

                  <div>

                    <h4 className="text-slate-500">
                      Generated On
                    </h4>

                    <p className="text-white mt-2">
                      {selectedReport?.date || "Pending"}
                    </p>

                  </div>

                </div>

                <div className="mt-8">

                  <h4 className="text-xl font-semibold text-white">
                    Executive Summary
                  </h4>

                  <p className="text-slate-300 leading-8 mt-4">
                    {selectedReport?.summary || "Select or generate a report to preview its content here."}
                  </p>

                </div>

              </div>

            </motion.div>

            {/* AI Summary */}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 p-8"
            >

              <h2 className="text-3xl font-bold text-white">
                AI Summary
              </h2>

              <p className="text-blue-100 leading-8 mt-6">
                Visham AI analyzes the current case context, evidence, suspects, and timeline in real time.
              </p>

              <div className="space-y-5 mt-8">

                <div className="bg-white/10 rounded-2xl p-5">

                  <h3 className="text-white font-semibold">
                    Confidence
                  </h3>

                  <p className="text-5xl font-black text-white mt-4">
                    {reports.filter((item) => item.status === "Completed").length > 0 ? "94%" : "—"}
                  </p>

                </div>

                <div className="bg-white/10 rounded-2xl p-5">

                  <h3 className="text-white font-semibold">
                    Risk Level
                  </h3>

                  <p className="text-5xl font-black text-red-200 mt-4">
                    {selectedReport ? "ACTIVE" : "NONE"}
                  </p>

                </div>

                <div className="bg-white/10 rounded-2xl p-5">

                  <h3 className="text-white font-semibold">
                    Similar Cases
                  </h3>

                  <p className="text-5xl font-black text-white mt-4">
                    {reports.length}
                  </p>

                </div>

              </div>

            </motion.div>

          </div>

          {/* Report Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >
              <h3 className="text-slate-400">
                Total Reports
              </h3>

              <p className="text-5xl font-black text-white mt-4">
                {reports.length}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >
              <h3 className="text-slate-400">
                Generated Today
              </h3>

              <p className="text-5xl font-black text-cyan-400 mt-4">
                {reports.filter((item) => item.status === "Completed").length}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >
              <h3 className="text-slate-400">
                AI Accuracy
              </h3>

              <p className="text-5xl font-black text-green-400 mt-4">
                94%
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >
              <h3 className="text-slate-400">
                Pending Reports
              </h3>

              <p className="text-5xl font-black text-yellow-400 mt-4">
                {reports.filter((item) => item.status !== "Completed").length}
              </p>
            </motion.div>

          </div>

          {/* Export Options */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

            <button onClick={() => selectedReport && downloadReport(selectedReport, "pdf")} className="rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-white font-bold text-xl hover:scale-105 transition">
              📄 Download PDF
            </button>

            <button onClick={() => selectedReport && downloadReport(selectedReport, "docx")} className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white font-bold text-xl hover:scale-105 transition">
              📝 Export DOCX
            </button>

            <button onClick={() => selectedReport && generateReport(selectedReport)} className="rounded-3xl bg-gradient-to-r from-purple-500 to-pink-600 p-8 text-white font-bold text-xl hover:scale-105 transition">
              🖨 Generate Report
            </button>

          </div>

          {/* Report History */}

          <div className="mt-10 rounded-3xl bg-slate-900 border border-slate-800 p-8">

            <h2 className="text-3xl font-bold text-white mb-8">
              Recent Report Activity
            </h2>

            <div className="space-y-6">

              <div className="flex justify-between items-center border-b border-slate-800 pb-4">

                <div>

                  <h3 className="text-white font-semibold">
                    REP-001 Generated
                  </h3>

                  <p className="text-slate-400">
                    Cyber Fraud Investigation
                  </p>

                </div>

                <span className="text-cyan-400">
                  Today
                </span>

              </div>

              <div className="flex justify-between items-center border-b border-slate-800 pb-4">

                <div>

                  <h3 className="text-white font-semibold">
                    REP-002 Downloaded
                  </h3>

                  <p className="text-slate-400">
                    Missing Person Case
                  </p>

                </div>

                <span className="text-cyan-400">
                  Yesterday
                </span>

              </div>

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="text-white font-semibold">
                    REP-003 Printed
                  </h3>

                  <p className="text-slate-400">
                    Financial Scam
                  </p>

                </div>

                <span className="text-cyan-400">
                  2 Days Ago
                </span>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>

  );

}