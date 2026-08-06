import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  BrainCircuit,
  Moon,
  Command,
  Clock3,
} from "lucide-react";
import api from "../../services/api";

const ROUTE_BY_LABEL = {
  Case: "/cases",
  Suspect: "/suspects",
  Evidence: "/evidence",
  Witness: "/cases",
  TimelineEvent: "/cases",
};

export default function Topbar() {

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const boxRef = useRef(null);

  const now = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get("/graph/search", {
          params: { query: trimmed },
        });
        setResults(data || []);
        setOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToResult(result) {
    setOpen(false);
    setQuery("");
    navigate(ROUTE_BY_LABEL[result.label] || "/cases");
  }

  return (

    <motion.header

      initial={{ y: -30, opacity: 0 }}

      animate={{ y: 0, opacity: 1 }}

      className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800"

    >

      <div className="px-8 py-5 flex justify-between items-center">

        {/* Search */}

        <div className="relative w-[420px]" ref={boxRef}>

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-slate-500"
          />

          <input

            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search cases, suspects, evidence..."

            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all"

          />

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-14 left-0 w-full rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
              >
                {searching ? (
                  <p className="p-4 text-slate-400 text-sm">Searching...</p>
                ) : results.length === 0 ? (
                  <p className="p-4 text-slate-400 text-sm">No matches found.</p>
                ) : (
                  results.map((result, idx) => (
                    <button
                      key={`${result.label}-${result.id}-${idx}`}
                      onClick={() => goToResult(result)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-800 transition"
                    >
                      <span className="text-white">{result.name}</span>
                      <span className="text-xs uppercase tracking-wider text-cyan-400">
                        {result.label}
                      </span>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right */}

        <div className="flex items-center gap-5">

          <div className="text-right">

            <p className="text-white font-semibold">

              {now}

            </p>

            <p className="text-slate-400 text-sm">

              Investigation Command Center

            </p>

          </div>

          <button
            onClick={() => navigate("/ai")}
            title="AI Workspace"
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:scale-105 transition"
          >

            <BrainCircuit className="mx-auto text-white"/>

          </button>

          <button
            onClick={() => navigate("/settings")}
            title="Settings"
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800"
          >

            <Command className="mx-auto text-white"/>

          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">

            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">

              A

            </div>

            <div>

              <h3 className="text-white font-semibold">

                Admin

              </h3>

              <div className="flex items-center gap-2 text-green-400 text-sm">

                <Clock3 size={14} />

                Active

              </div>

            </div>

          </div>

        </div>

      </div>

    </motion.header>

  );

}