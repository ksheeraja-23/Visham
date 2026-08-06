import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
  FiBriefcase,
} from "react-icons/fi";

import { register } from "../services/registerService";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    designation: "",
    role: "Investigator",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    if (
      !form.full_name ||
      !form.username ||
      !form.email ||
      !form.designation ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (form.password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register({
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        designation: form.designation,
        role: form.role,
        password: form.password,
      });

      alert("Registration Successful!");

      navigate("/");

    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8">
    {/* Register Card */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-10 shadow-2xl z-10"
      >
        <div className="text-center">

          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <FiShield className="text-white text-4xl" />
          </div>

          <h1 className="text-4xl font-black text-white mt-6">
            Create Account
          </h1>

          <p className="text-slate-400 mt-2">
            Join the Visham Investigation Platform
          </p>

        </div>

        <div className="grid grid-cols-2 gap-5 mt-10">

          {/* Full Name */}

          <div className="col-span-2">

            <label className="text-slate-300">
              Full Name
            </label>

            <div className="relative mt-2">

              <FiUser className="absolute left-4 top-4 text-slate-500" />

              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Enter Full Name"
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 text-white outline-none focus:border-cyan-500"
              />

            </div>

          </div>

          {/* Username */}

          <div>

            <label className="text-slate-300">
              Username
            </label>

            <div className="relative mt-2">

              <FiUser className="absolute left-4 top-4 text-slate-500" />

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 text-white outline-none focus:border-cyan-500"
              />

            </div>

          </div>

          {/* Email */}

          <div>

            <label className="text-slate-300">
              Email
            </label>

            <div className="relative mt-2">

              <FiMail className="absolute left-4 top-4 text-slate-500" />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 text-white outline-none focus:border-cyan-500"
              />

            </div>

          </div>

          {/* Designation */}

          <div>

            <label className="text-slate-300">
              Designation
            </label>

            <div className="relative mt-2">

              <FiBriefcase className="absolute left-4 top-4 text-slate-500" />

              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Designation"
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 text-white outline-none focus:border-cyan-500"
              />

            </div>

          </div>

          {/* Role */}

          <div>

            <label className="text-slate-300">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 px-4 text-white outline-none focus:border-cyan-500"
            >
              <option>Investigator</option>
              <option>Analyst</option>
              <option>Supervisor</option>
              <option>Administrator</option>
            </select>

          </div>
          {/* Password */}

          <div>

            <label className="text-slate-300">
              Password
            </label>

            <div className="relative mt-2">

              <FiLock className="absolute left-4 top-4 text-slate-500" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 pr-12 text-white outline-none focus:border-cyan-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-4 text-slate-400"
              >
                {showPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>

            </div>

          </div>
          
          {/* Confirm Password */}

          <div>

            <label className="text-slate-300">
              Confirm Password
            </label>

            <div className="relative mt-2">

              <FiLock className="absolute left-4 top-4 text-slate-500" />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-4 pl-12 pr-12 text-white outline-none focus:border-cyan-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-4 text-slate-400"
              >
                {showConfirmPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>

            </div>

          </div>

        </div>

        {/* Register Button */}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

        {/* Login Link */}

        <p className="text-center text-slate-400 mt-8">
          Already have an account?

          <Link
            to="/"
            className="text-cyan-400 ml-2 hover:underline"
          >
            Login
          </Link>

        </p>

      </motion.div>

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