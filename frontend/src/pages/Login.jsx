import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { login } from "../services/authService";
export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  try {
    setLoading(true);

    const res = await login(username, password);

    localStorage.setItem("token", res.access_token);

    navigate("/dashboard");

  } catch (err) {
    alert(
      err.response?.data?.detail ||
      "Invalid username or password"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8">

      {/* Login Card */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-10 shadow-2xl z-10"
      >
        <div className="text-center">

          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <FiShield className="text-white text-4xl" />
          </div>

          <h1 className="text-4xl font-black text-white mt-6">
            Visham
          </h1>

          <p className="text-slate-400 mt-2">
            Investigation Management System
          </p>

        </div>

        <div className="mt-10">

          <label className="text-slate-300">
            Username
          </label>

          <div className="relative mt-2">

            <FiMail className="absolute left-4 top-4 text-slate-500" />

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

          <div className="mt-6">

            <label className="text-slate-300">
              Password
            </label>

            <div className="relative mt-2">

              <FiLock className="absolute left-4 top-4 text-slate-500" />

              <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 pr-14 text-white outline-none focus:border-cyan-500"
                />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-400"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>

            </div>

          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-slate-400 mt-8">
            Don't have an account?
            <Link
              to="/register"
              className="text-cyan-400 ml-2 hover:underline transition"
            >
              Register
            </Link>
          </p>

        </div>

      </motion.div>

            {/* Right Side */}

      <div className="hidden lg:flex flex-1 items-center justify-center pl-20">

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl"
        >

          <h1 className="text-6xl font-black text-white leading-tight">

            AI Powered

            <span className="block text-cyan-400">

              Investigation Platform

            </span>

          </h1>

          <p className="text-slate-300 text-xl mt-8 leading-9">

            Visham helps investigators manage criminal cases,
            analyse evidence, generate AI summaries,
            detect contradictions and produce professional
            investigation reports in seconds.

          </p>

          <div className="grid grid-cols-2 gap-6 mt-12">

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6"
            >

              <h3 className="text-white font-bold text-xl">

                AI Analysis

              </h3>

              <p className="text-slate-400 mt-3">

                Smart evidence analysis powered
                by artificial intelligence.

              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6"
            >

              <h3 className="text-white font-bold text-xl">

                Case Tracking

              </h3>

              <p className="text-slate-400 mt-3">

                Organize investigations from
                start to completion.

              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6"
            >

              <h3 className="text-white font-bold text-xl">

                Secure Storage

              </h3>

              <p className="text-slate-400 mt-3">

                Keep all evidence and reports
                securely encrypted.

              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6"
            >

              <h3 className="text-white font-bold text-xl">

                Report Generation

              </h3>

              <p className="text-slate-400 mt-3">

                Generate investigation reports
                instantly with AI.

              </p>

            </motion.div>

          </div>

        </motion.div>

      </div>
            {/* Footer */}

      <div className="absolute bottom-6 left-0 w-full text-center">

        <p className="text-slate-500 text-sm">

          © 2026 Visham Investigation Management System

        </p>

        <p className="text-slate-600 mt-2">

          Secure • Intelligent • Reliable

        </p>

      </div>

    </div>

  );

}