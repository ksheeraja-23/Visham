import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderOpen,
  LayoutDashboard,
  FileText,
  Users,
  Clock3,
  BrainCircuit,
  Settings,
} from "lucide-react";

const items = [
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

export default function CommandPalette() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");

  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    setOpen(true);
  });

  useHotkeys("esc", () => {
    setOpen(false);
  });

  if (!open) return null;

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center pt-28 z-[100]">

      <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-5 top-5 text-slate-500"
          />

          <input
            autoFocus
            placeholder="Search anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-4 pl-12 pr-4 text-white outline-none border-b border-slate-800"
          />

        </div>

        <div className="max-h-96 overflow-y-auto">

          {filtered.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.title}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800 transition text-left"
              >

                <Icon
                  size={20}
                  className="text-cyan-400"
                />

                <span className="text-white">

                  {item.title}

                </span>

              </button>
            );

          })}

        </div>

      </div>

    </div>
  );
}