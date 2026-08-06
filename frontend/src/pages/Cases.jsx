import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  FolderOpen
} from "lucide-react";

import {
  getCases,
  createCase,
  updateCase,
  deleteCase
} from "../services/caseService";

export default function Cases() {

  const emptyCase = {
    case_number: "",
    title: "",
    description: "",
    status: "Open",
    priority: "Medium",
    location: "",
    incident_date: "",
    created_by: "Admin"
  };

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyCase);

  async function loadCases() {

    try {

      const data = await getCases();

      setCases(data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadCases();

  }, []);

  const filteredCases = useMemo(() => {
    const query = search.toLowerCase();
    return cases.filter((c) =>
      (c.title || "").toLowerCase().includes(query) ||
      (c.case_number || "").toLowerCase().includes(query) ||
      (c.location || "").toLowerCase().includes(query)
    );
  }, [cases, search]);

  const pagedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, page]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));

  function openCreate() {
    setPage(1);
    setEditing(null);

    setForm(emptyCase);

    setShowModal(true);

  }

  function openEdit(item) {

    setEditing(item.id);

    setForm({
      ...item,
      incident_date: item.incident_date
    });

    setShowModal(true);

  }

  async function handleSubmit(e) {

    e.preventDefault();

    try {

      if (editing) {

        await updateCase(editing, form);

      } else {

        await createCase(form);

      }

      setShowModal(false);

      loadCases();

    } catch (err) {

      console.log(err);

    }

  }

  async function removeCase(id) {

    if (!window.confirm("Delete this case?"))

      return;

    await deleteCase(id);

    loadCases();

  }

  useEffect(() => {
    setPage(1);
  }, [search]);

  const badge = (status) => {

    switch (status) {

      case "Open":

        return "bg-blue-600";

      case "Closed":

        return "bg-green-600";

      default:

        return "bg-orange-600";

    }

  };

  const priorityColor = (priority) => {

    switch (priority) {

      case "Low":

        return "text-green-400";

      case "Medium":

        return "text-yellow-400";

      case "High":

        return "text-orange-400";

      default:

        return "text-red-500";

    }

  };

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-3xl">

        Loading Cases...

      </div>

    );

  }

  return (

    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-8">

          <div className="flex justify-between items-center">

            <div>

              <h1 className="text-4xl font-bold text-white">

                Cases

              </h1>

              <p className="text-slate-400 mt-2">

                Manage investigations

              </p>

            </div>

            <button
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 px-6 py-3 rounded-xl flex items-center gap-2 text-white"
        >

              <Plus size={18}/>

              New Case

            </button>

          </div>

          <div className="mt-8 relative">

            <Search
              className="absolute left-4 top-3 text-slate-500"
            />

            <input

              placeholder="Search case..."

              value={search}

              onChange={(e)=>setSearch(e.target.value)}

              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 py-3 text-white"

            />

          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">

            <table className="w-full">

              <thead className="bg-slate-900">

                <tr className="text-left text-slate-400">

                  <th className="p-5">Case</th>

                  <th>Status</th>

                  <th>Priority</th>

                  <th>Location</th>

                  <th>Date</th>

                  <th></th>

                </tr>

              </thead>

              <tbody>

                {filteredCases.map((item,index)=>(

                  <motion.tr

                    initial={{opacity:0,y:20}}

                    animate={{opacity:1,y:0}}

                    transition={{delay:index*.05}}

                    key={item.id}

                    className="border-t border-slate-800 hover:bg-slate-900"

                  >

                    <td className="p-5">

                      <div className="font-semibold text-white">

                        {item.title}

                      </div>

                      <div className="text-slate-400 text-sm">

                        {item.case_number}

                      </div>

                    </td>

                    <td>

                      <span className={`${badge(item.status)} px-3 py-1 rounded-full text-sm`}>

                        {item.status}

                      </span>

                    </td>

                    <td>

                      <span className={`${priorityColor(item.priority)} font-semibold`}>

                        {item.priority}

                      </span>

                    </td>

                    <td>

                      <div className="flex items-center gap-2 text-slate-300">

                        <MapPin size={15}/>

                        {item.location}

                      </div>

                    </td>

                    <td>

                      <div className="flex items-center gap-2 text-slate-300">

                        <Calendar size={15}/>

                        {item.incident_date}

                      </div>

                    </td>

                    <td>

                      <div className="flex gap-3">

                        <button

                          onClick={()=>openEdit(item)}

                          className="text-blue-400"

                        >

                          <Pencil size={18}/>

                        </button>

                        <button

                          onClick={()=>removeCase(item.id)}

                          className="text-red-500"

                        >

                          <Trash2 size={18}/>

                        </button>

                      </div>

                    </td>

                  </motion.tr>

                ))}

                {filteredCases.length===0 && (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-20 text-slate-500"
                    >

                      <FolderOpen
                        className="mx-auto mb-4"
                        size={60}
                      />

                      No Cases Found

                    </td>

                  </tr>

                )}
                              </tbody>

            </table>

          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
            <span>Showing {pagedCases.length} of {filteredCases.length} cases</span>
            <div className="flex gap-2">
              <button className="rounded-lg border border-slate-700 px-3 py-2" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>Previous</button>
              <span className="rounded-lg border border-slate-700 px-3 py-2">{page}/{totalPages}</span>
              <button className="rounded-lg border border-slate-700 px-3 py-2" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>Next</button>
            </div>
          </div>

        </main>

      </div>

      {showModal && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <motion.div

            initial={{opacity:0,scale:.9}}

            animate={{opacity:1,scale:1}}

            exit={{opacity:0}}

            className="bg-slate-900 w-full max-w-2xl rounded-2xl p-8 border border-slate-800"

          >

            <div className="flex justify-between items-center mb-8">

              <h2 className="text-2xl font-bold text-white">

                {editing ? "Edit Case" : "Create New Case"}

              </h2>

              <button

                onClick={()=>setShowModal(false)}

                className="text-slate-400 hover:text-white"

              >

                ✕

              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="grid grid-cols-2 gap-4">

                <input

                  required

                  placeholder="Case Number"

                  value={form.case_number}

                  onChange={(e)=>

                    setForm({
                      ...form,
                      case_number:e.target.value
                    })

                  }

                  className="bg-slate-800 rounded-xl p-3 text-white"

                />

                <input

                  required

                  placeholder="Case Title"

                  value={form.title}

                  onChange={(e)=>

                    setForm({
                      ...form,
                      title:e.target.value
                    })

                  }

                  className="bg-slate-800 rounded-xl p-3 text-white"

                />

              </div>

              <textarea

                required

                rows={5}

                placeholder="Description"

                value={form.description}

                onChange={(e)=>

                  setForm({
                    ...form,
                    description:e.target.value
                  })

                }

                className="w-full bg-slate-800 rounded-xl p-3 text-white"

              />

              <div className="grid grid-cols-2 gap-4">

                <select

                  value={form.status}

                  onChange={(e)=>

                    setForm({
                      ...form,
                      status:e.target.value
                    })

                  }

                  className="bg-slate-800 rounded-xl p-3 text-white"

                >

                  <option>Open</option>

                  <option>Closed</option>

                  <option>Investigation</option>

                </select>

                <select

                  value={form.priority}

                  onChange={(e)=>

                    setForm({
                      ...form,
                      priority:e.target.value
                    })

                  }

                  className="bg-slate-800 rounded-xl p-3 text-white"

                >

                  <option>Low</option>

                  <option>Medium</option>

                  <option>High</option>

                  <option>Critical</option>

                </select>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <input

                  required

                  placeholder="Location"

                  value={form.location}

                  onChange={(e)=>

                    setForm({
                      ...form,
                      location:e.target.value
                    })

                  }

                  className="bg-slate-800 rounded-xl p-3 text-white"

                />

                <input

                  required

                  type="date"

                  value={form.incident_date}

                  onChange={(e)=>

                    setForm({
                      ...form,
                      incident_date:e.target.value
                    })

                  }

                  className="bg-slate-800 rounded-xl p-3 text-white"

                />

              </div>

              {!editing && (

                <input

                  placeholder="Created By"

                  value={form.created_by}

                  onChange={(e)=>

                    setForm({
                      ...form,
                      created_by:e.target.value
                    })

                  }

                  className="w-full bg-slate-800 rounded-xl p-3 text-white"

                />

              )}

              <div className="flex justify-end gap-4 pt-4">

                <button

                  type="button"

                  onClick={()=>setShowModal(false)}

                  className="px-6 py-3 rounded-xl bg-slate-700 text-white hover:bg-slate-600"

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"

                >

                  {editing ? "Update Case" : "Create Case"}

                </button>

              </div>

            </form>

          </motion.div>

        </div>

      )}

    </div>

  );

}