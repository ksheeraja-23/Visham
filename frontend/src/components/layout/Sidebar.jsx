import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  Clock3,
  BrainCircuit,
  Settings,
  Shield,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Cases",
    icon: FolderOpen,
    path: "/cases",
  },
  {
    title: "Evidence",
    icon: FileText,
    path: "/evidence",
  },
  {
    title: "Suspects",
    icon: Users,
    path: "/suspects",
  },
  {
    title: "Timeline",
    icon: Clock3,
    path: "/timeline",
  },
  {
    title: "AI Workspace",
    icon: BrainCircuit,
    path: "/ai",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col justify-between">

      <div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8"
        >
          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg">

              <Shield
                size={28}
                color="white"
              />

            </div>

            <div>

              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

                VISHAM

              </h1>

              <p className="text-slate-500 text-sm">

                Investigation Platform

              </p>

            </div>

          </div>
        </motion.div>

        <nav className="px-4 mt-6 space-y-2">

          {menu.map((item, index) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-2xl ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                      : "hover:bg-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{
                      x: 6,
                    }}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <Icon
                      size={22}
                      color={isActive ? "white" : "#94a3b8"}
                    />

                    <span
                      className={`font-semibold ${
                        isActive
                          ? "text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {item.title}
                    </span>
                  </motion.div>
                )}
              </NavLink>

            );
          })}
        </nav>
      </div>

      <div className="p-5">

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">

              A

            </div>

            <div>

              <h3 className="text-white font-semibold">

                Administrator

              </h3>

              <p className="text-slate-400 text-sm">

                Lead Investigator

              </p>

            </div>

          </div>

          <div className="mt-5 flex justify-between items-center">

            <span className="text-slate-400">

              AI Status

            </span>

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"/>

              <span className="text-green-400">

                Online

              </span>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}