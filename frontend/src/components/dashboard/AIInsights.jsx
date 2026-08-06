import { motion } from "framer-motion";
import {
  BrainCircuit,
  ShieldAlert,
  Fingerprint,
  TriangleAlert,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const insights = [
  {
    title: "Fingerprint Match",
    description: "89% similarity with Case #CS-1042",
    icon: Fingerprint,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Threat Level",
    description: "High Risk Suspect Identified",
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    title: "AI Recommendation",
    description: "Interview Witness #3 immediately.",
    icon: BrainCircuit,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Anomaly Found",
    description: "Timeline contains conflicting statements.",
    icon: TriangleAlert,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

export default function AIInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -5 }}
      className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold text-white">

            AI Intelligence

          </h2>

          <p className="text-slate-400">

            Live investigation insights

          </p>

        </div>

        <div className="relative">

          <Sparkles
            size={34}
            className="text-cyan-400"
          />

          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 animate-ping"/>

        </div>

      </div>

      <div className="space-y-4">

        {insights.map((item, index) => {

          const Icon = item.icon;

          return (

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
              }}
              className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 cursor-pointer"
            >

              <div className="flex justify-between items-start">

                <div className="flex gap-4">

                  <div
                    className={`${item.bg} rounded-xl p-3`}
                  >

                    <Icon
                      size={22}
                      className={item.color}
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-white">

                      {item.title}

                    </h3>

                    <p className="text-slate-400 text-sm mt-1">

                      {item.description}

                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-500"
                />

              </div>

            </motion.div>

          );

        })}

      </div>

      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5">

        <p className="text-white text-sm">

          AI Confidence

        </p>

        <h1 className="text-5xl font-black text-white mt-2">

          96%

        </h1>

        <div className="w-full bg-white/20 h-2 rounded-full mt-5">

          <div className="w-[96%] h-2 rounded-full bg-white"/>

        </div>

      </div>

    </motion.div>
  );
}