import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";

const cases = [
  {
    id: "CS-1045",
    title: "Bank Fraud Investigation",
    location: "Pune",
    date: "04 Jul 2026",
    status: "Open",
    priority: "High",
  },
  {
    id: "CS-1046",
    title: "Cyber Attack",
    location: "Mumbai",
    date: "03 Jul 2026",
    status: "Investigation",
    priority: "Critical",
  },
  {
    id: "CS-1047",
    title: "Missing Person",
    location: "Delhi",
    date: "02 Jul 2026",
    status: "Closed",
    priority: "Medium",
  },
];

const statusColor = {
  Open: "bg-blue-500/20 text-blue-400",
  Investigation: "bg-orange-500/20 text-orange-400",
  Closed: "bg-green-500/20 text-green-400",
};

const priorityColor = {
  Low: "bg-green-500/20 text-green-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  High: "bg-orange-500/20 text-orange-400",
  Critical: "bg-red-500/20 text-red-400",
};

export default function RecentCases() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl p-6"
    >
      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold text-white">

            Recent Cases

          </h2>

          <p className="text-slate-400">

            Latest investigations

          </p>

        </div>

        <button className="text-cyan-400 hover:text-cyan-300 font-semibold">

          View All

        </button>

      </div>

      <div className="space-y-5">

        {cases.map((item, index) => (

          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{
              y: -3,
              scale: 1.01,
            }}
            className="rounded-2xl bg-slate-800/60 border border-slate-700 p-5 transition-all cursor-pointer"
          >

            <div className="flex justify-between items-start">

              <div>

                <p className="text-cyan-400 font-semibold">

                  {item.id}

                </p>

                <h3 className="text-white text-xl font-bold mt-1">

                  {item.title}

                </h3>

              </div>

              <ArrowRight
                className="text-slate-500"
                size={20}
              />

            </div>

            <div className="flex gap-6 mt-5 text-slate-400 text-sm">

              <div className="flex items-center gap-2">

                <MapPin size={15} />

                {item.location}

              </div>

              <div className="flex items-center gap-2">

                <Calendar size={15} />

                {item.date}

              </div>

            </div>

            <div className="flex gap-3 mt-5">

              <span
                className={`px-4 py-1 rounded-full text-sm ${statusColor[item.status]}`}
              >
                {item.status}
              </span>

              <span
                className={`px-4 py-1 rounded-full text-sm ${priorityColor[item.priority]}`}
              >
                {item.priority}
              </span>

            </div>

          </motion.div>

        ))}

      </div>

    </motion.div>
  );
}