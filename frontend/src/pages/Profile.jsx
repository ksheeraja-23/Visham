import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiAward,
  FiEdit,
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function Profile() {

  return (

    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-8">

          <div className="flex justify-between items-center mb-10">

            <div>

              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">

                Officer Profile

              </h1>

              <p className="text-slate-400 mt-3 text-lg">

                View and manage your account.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-white font-semibold">

              <FiEdit />

              Edit Profile

            </button>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Profile Card */}

            <motion.div

              initial={{ opacity: 0, x: -20 }}

              animate={{ opacity: 1, x: 0 }}

              className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center"

            >

              <div className="w-36 h-36 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto">

                <FiUser className="text-white text-6xl"/>

              </div>

              <h2 className="text-3xl text-white font-bold mt-6">

                Inspector Sharma

              </h2>

              <p className="text-cyan-400 mt-2">

                Senior Investigation Officer

              </p>

              <button className="mt-8 w-full rounded-2xl bg-cyan-600 hover:bg-cyan-700 py-3 text-white">

                Change Photo

              </button>

            </motion.div>

            {/* Details */}

            <motion.div

              initial={{ opacity: 0, x: 20 }}

              animate={{ opacity: 1, x: 0 }}

              className="xl:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8"

            >

              <h2 className="text-3xl font-bold text-white">

                Personal Information

              </h2>

              <div className="grid grid-cols-2 gap-8 mt-10">

                <div>

                  <FiMail className="text-cyan-400 text-2xl"/>

                  <h3 className="text-slate-400 mt-3">

                    Email

                  </h3>

                  <p className="text-white mt-2">

                    inspector@visham.ai

                  </p>

                </div>

                <div>

                  <FiPhone className="text-green-400 text-2xl"/>

                  <h3 className="text-slate-400 mt-3">

                    Phone

                  </h3>

                  <p className="text-white mt-2">

                    +91 9876543210

                  </p>

                </div>

                <div>

                  <FiMapPin className="text-yellow-400 text-2xl"/>

                  <h3 className="text-slate-400 mt-3">

                    Station

                  </h3>

                  <p className="text-white mt-2">

                    Pune Cyber Cell

                  </p>

                </div>

                <div>

                  <FiBriefcase className="text-purple-400 text-2xl"/>

                  <h3 className="text-slate-400 mt-3">

                    Experience

                  </h3>

                  <p className="text-white mt-2">

                    12 Years

                  </p>

                </div>
                              </div>

            </motion.div>

          </div>

          {/* Statistics */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center"
            >

              <FiAward className="mx-auto text-5xl text-yellow-400"/>

              <p className="text-5xl font-black text-white mt-4">
                128
              </p>

              <p className="text-slate-400 mt-2">
                Cases Solved
              </p>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center"
            >

              <p className="text-5xl font-black text-cyan-400">
                156
              </p>

              <p className="text-slate-400 mt-2">
                Total Cases
              </p>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center"
            >

              <p className="text-5xl font-black text-green-400">
                94%
              </p>

              <p className="text-slate-400 mt-2">
                Success Rate
              </p>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center"
            >

              <p className="text-5xl font-black text-purple-400">
                12
              </p>

              <p className="text-slate-400 mt-2">
                Awards
              </p>

            </motion.div>

          </div>

          {/* Account Settings */}

          <div className="mt-10 rounded-3xl bg-slate-900 border border-slate-800 p-8">

            <h2 className="text-3xl font-bold text-white mb-8">
              Account Settings
            </h2>

            <div className="space-y-5">

              <button className="w-full rounded-2xl bg-slate-800 hover:bg-slate-700 p-5 text-left text-white transition">
                Change Password
              </button>

              <button className="w-full rounded-2xl bg-slate-800 hover:bg-slate-700 p-5 text-left text-white transition">
                Enable Two-Factor Authentication
              </button>

              <button className="w-full rounded-2xl bg-slate-800 hover:bg-slate-700 p-5 text-left text-white transition">
                Notification Preferences
              </button>

              <button className="w-full rounded-2xl bg-red-600 hover:bg-red-700 p-5 text-white font-semibold transition">
                Logout
              </button>

            </div>

          </div>

        </main>

      </div>

    </div>

  );

}