import { motion } from "framer-motion";
import {
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiPlus,
  FiUsers,
  FiEye,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const defaultStats = [
  {
    title: "Total Cases",
    value: 0,
    icon: <FiFolder size={28} />,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Active Cases",
    value: 0,
    icon: <FiClock size={28} />,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Closed Cases",
    value: 0,
    icon: <FiCheckCircle size={28} />,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Evidence",
    value: 0,
    icon: <FiEye size={28} />,
    color: "from-red-500 to-pink-600",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(defaultStats);
  const [summary, setSummary] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [caseCategories, setCaseCategories] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [summaryRes, casesRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/cases"),
      ]);
      const data = summaryRes.data;
      setSummary(data);
      setStats([
        {
          title: "Total Cases",
          value: data.cases ?? 0,
          icon: <FiFolder size={28} />,
          color: "from-cyan-500 to-blue-600",
        },
        {
          title: "Active Cases",
          value: data.active_cases ?? 0,
          icon: <FiClock size={28} />,
          color: "from-yellow-500 to-orange-500",
        },
        {
          title: "Closed Cases",
          value: data.closed_cases ?? 0,
          icon: <FiCheckCircle size={28} />,
          color: "from-green-500 to-emerald-600",
        },
        {
          title: "Evidence",
          value: data.evidence ?? 0,
          icon: <FiEye size={28} />,
          color: "from-red-500 to-pink-600",
        },
      ]);

      const cases = Array.isArray(casesRes.data) ? casesRes.data : [];
      setRecentCases(cases.slice(0, 4));
      const counts = cases.reduce((acc, item) => {
        const category = item.title?.includes("Heist") ? "Museum Theft" : (item.title?.split(" ")[0] || "General");
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      setCaseCategories(Object.entries(counts).map(([name, count]) => ({ name, count })));
    } catch (err) {
      console.error("Dashboard Error:", err);
    }
  };

  const chartData = useMemo(() => {
    const total = caseCategories.reduce((sum, item) => sum + item.count, 0) || 1;
    return caseCategories.map((item) => ({
      ...item,
      percent: Math.round((item.count / total) * 100),
    }));
  }, [caseCategories]);

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
                Investigation Dashboard
              </h1>

              <p className="text-slate-400 mt-3 text-lg">
                Welcome back, Investigator.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/cases")}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
            >
              <FiPlus />
              New Investigation
            </motion.button>

          </div>

          {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {stats.map((stat, index) => (

              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                className={`rounded-3xl bg-gradient-to-r ${stat.color} p-6 shadow-xl`}
              >

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm uppercase tracking-wider text-white/80">
                      {stat.title}
                    </p>

                    <h2 className="text-4xl font-black text-white mt-3">
                      {stat.value}
                    </h2>

                  </div>

                  <div className="bg-white/20 rounded-2xl p-4 text-white">
                    {stat.icon}
                  </div>

                </div>

                <div className="mt-6 h-2 bg-white/20 rounded-full overflow-hidden">

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(stat.value, 100)}%`,
                    }}
                    transition={{
                      duration: 1.2,
                    }}
                    className="h-full bg-white rounded-full"
                  />

                </div>

              </motion.div>

            ))}

          </div>

          {/* Charts Row */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

            {/* Crime Categories */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .5 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >

              <h2 className="text-2xl font-bold text-white mb-6">
                Crime Categories
              </h2>

              <div className="space-y-5">
                {chartData.length === 0 ? (
                  <p className="text-slate-400">No case categories available yet.</p>
                ) : chartData.map((item, index) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-slate-300">
                      <span>{item.name}</span>
                      <span>{item.percent}%</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-700 mt-2">
                      <div
                        className={`h-3 rounded-full ${index % 2 === 0 ? "bg-cyan-500" : "bg-blue-500"}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>

            {/* AI Insights */}

            <motion.div

              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .6 }}
              className="xl:col-span-2 rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 p-8"
            >

              <h2 className="text-3xl font-bold text-white">
                AI Investigation Insights
              </h2>

              <p className="text-blue-100 mt-4">
                AI processed {summary?.cases ?? 0} investigations in the current workspace,
                surfaced {summary?.suspects ?? 0} suspects,
                and generated {summary?.ai_reports ?? 0} investigation summaries from live case data.
              </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <h3 className="text-white font-semibold">
                    AI Summaries
                  </h3>

                  <p className="text-5xl font-black text-white mt-4">
                    {summary?.ai_reports ?? 0}
                  </p>

                  <p className="text-blue-100 mt-2">
                    Generated this week
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <h3 className="text-white font-semibold">
                    Contradictions
                  </h3>

                  <p className="text-5xl font-black text-white mt-4">
                    {summary?.suspects ?? 0}
                  </p>

                  <p className="text-blue-100 mt-2">
                    Potential conflicts found
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <h3 className="text-white font-semibold">
                    Risk Alerts
                  </h3>

                  <p className="text-5xl font-black text-white mt-4">
                    {summary?.witnesses ?? 0}
                  </p>

                  <p className="text-blue-100 mt-2">
                    High priority investigations
                  </p>
                </div>

              </div>

            </motion.div>

          </div>

          {/* Recent Cases */}

          <div className="mt-10 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">

            <div className="flex justify-between items-center p-6 border-b border-slate-800">

              <h2 className="text-2xl font-bold text-white">
                Recent Investigations
              </h2>

              <button onClick={() => navigate("/cases")} className="text-cyan-400 hover:text-cyan-300 font-semibold">
                View All
              </button>

            </div>

            <table className="w-full">

              <thead className="bg-slate-800">

                <tr>

                  <th className="text-left p-5 text-slate-300">
                    Case ID
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Title
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Officer
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Status
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Priority
                  </th>

                </tr>

              </thead>

              <tbody>
                {recentCases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-5 text-center text-slate-400">No recent cases found.</td>
                  </tr>
                ) : recentCases.map((item) => (
                  <tr key={item.id} className="border-t border-slate-800 hover:bg-slate-800 transition">
                    <td className="p-5 text-white">{item.case_number}</td>
                    <td className="p-5 text-slate-300">{item.title}</td>
                    <td className="p-5 text-slate-300">{item.created_by}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-sm ${item.status === "Closed" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-sm ${item.priority === "High" ? "bg-red-500/20 text-red-400" : item.priority === "Medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          {/* Quick Actions */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: .97 }}
              onClick={() => navigate("/cases")}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white"
            >
              📂
              <h3 className="text-xl font-bold mt-4">
                Manage Cases
              </h3>

              <p className="text-slate-400 mt-2">
                View and update investigations.
              </p>

            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: .97 }}
              onClick={() => navigate("/ai")}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white"
            >
              🤖
              <h3 className="text-xl font-bold mt-4">
                AI Workspace
              </h3>

              <p className="text-slate-400 mt-2">
                Launch Visham AI Assistant.
              </p>

            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: .97 }}
              onClick={() => navigate("/reports")}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white"
            >
              📄
              <h3 className="text-xl font-bold mt-4">
                Reports
              </h3>

              <p className="text-slate-400 mt-2">
                Generate investigation reports.
              </p>

            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: .97 }}
              onClick={() => navigate("/settings")}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white"
            >
              ⚙️
              <h3 className="text-xl font-bold mt-4">
                Settings
              </h3>

              <p className="text-slate-400 mt-2">
                Configure the investigation system.
              </p>

            </motion.button>

          </div>

        </main>

      </div>

    </div>

  );
}