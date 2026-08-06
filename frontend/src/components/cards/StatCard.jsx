import CountUp from "react-countup";
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon,
  color,
}) {

  return (

    <motion.div

      whileHover={{
        y:-8,
        scale:1.03
      }}

      transition={{
        duration:.25
      }}

      className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl"

    >

      <div
        className={`absolute inset-0 opacity-10 ${color}`}
      />

      <div className="relative flex justify-between">

        <div>

          <p className="uppercase tracking-widest text-xs text-slate-400">

            {title}

          </p>

          <h1 className="text-5xl font-black text-white mt-4">

            <CountUp

              end={value}

              duration={1.8}

            />

          </h1>

        </div>

        <div className={`${color} rounded-2xl p-5`}>

          {icon}

        </div>

      </div>

    </motion.div>

  );

}