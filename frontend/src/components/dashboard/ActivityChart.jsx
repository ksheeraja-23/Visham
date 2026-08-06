import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", cases: 5 },
  { day: "Tue", cases: 8 },
  { day: "Wed", cases: 12 },
  { day: "Thu", cases: 9 },
  { day: "Fri", cases: 14 },
  { day: "Sat", cases: 10 },
  { day: "Sun", cases: 16 },
];

export default function ActivityChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl p-6"
    >
      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold text-white">

            Investigation Activity

          </h2>

          <p className="text-slate-400 mt-1">

            Cases registered this week

          </p>

        </div>

        <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl">

          Live

        </div>

      </div>

      <ResponsiveContainer width="100%" height={330}>

        <AreaChart data={data}>

          <defs>

            <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">

              <stop
                offset="5%"
                stopColor="#3b82f6"
                stopOpacity={0.8}
              />

              <stop
                offset="95%"
                stopColor="#3b82f6"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#334155"
          />

          <XAxis
            dataKey="day"
            stroke="#94a3b8"
          />

          <YAxis
            stroke="#94a3b8"
          />

          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              color: "#fff",
            }}
          />

          <Area
            type="monotone"
            dataKey="cases"
            stroke="#3b82f6"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorCases)"
          />

        </AreaChart>

      </ResponsiveContainer>

    </motion.div>
  );
}