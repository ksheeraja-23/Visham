import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud,
  FiImage,
  FiFileText,
  FiVideo,
  FiMic,
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { getEvidence, uploadEvidence } from "../services/evidenceService";

export default function EvidenceUpload() {
  const [evidence, setEvidence] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({
    case_id: "",
    title: "",
    description: "",
    evidence_type: "Image",
    uploaded_by: "",
  });

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    try {
      const data = await getEvidence();
      setEvidence(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Select a file first");
      return;
    }

    try {
      await uploadEvidence(selectedFile, form, setUploadProgress);
      alert("Upload Successful");
      setSelectedFile(null);
      setForm((prev) => ({ ...prev, title: "", description: "", uploaded_by: "" }));
      loadEvidence();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };
  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-8">

          <div className="flex justify-between items-center mb-10">

            <div>

              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">

                Evidence Management

              </h1>

              <p className="text-slate-400 mt-3 text-lg">

                Upload and organize digital evidence.

              </p>

            </div>

          </div>

          {/* Upload Area */}

          <motion.div

            whileHover={{ scale: 1.01 }}

            className="rounded-3xl border-2 border-dashed border-cyan-500 bg-slate-900 p-16 text-center"

          >

            <FiUploadCloud className="mx-auto text-cyan-400 text-7xl" />

            <h2 className="text-3xl text-white font-bold mt-6">

              Drag & Drop Files

            </h2>

            <p className="text-slate-400 mt-3">

              Upload Images, Videos, Audio, PDFs or Documents

            </p>

                    <button
                        onClick={() =>
                            document.getElementById("fileUpload").click()
                        }
                        className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-white font-semibold"
                        >
                        Browse Files
                        </button>
            <input
                type="file"
                hidden
                id="fileUpload"
                onChange={(e) =>
                    setSelectedFile(e.target.files[0])
                }
                />

          </motion.div>

          {/* Evidence Types */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center">

              <FiImage className="mx-auto text-5xl text-pink-400" />

              <h3 className="text-white font-bold mt-5">

                Images

              </h3>

            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center">

              <FiVideo className="mx-auto text-5xl text-green-400" />

              <h3 className="text-white font-bold mt-5">

                Videos

              </h3>

            </div>
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center">

              <FiFileText className="mx-auto text-5xl text-yellow-400" />

              <h3 className="text-white font-bold mt-5">
                Documents
              </h3>

            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center">

              <FiMic className="mx-auto text-5xl text-cyan-400" />

              <h3 className="text-white font-bold mt-5">
                Audio
              </h3>

            </div>

          </div>

          {/* Uploaded Evidence */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            className="mt-10 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden"

          >

            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-3xl font-bold text-white">Uploaded Evidence</h2>
              <button
                onClick={() => document.getElementById("fileUpload").click()}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2 text-white"
              >
                + Upload More
              </button>
            </div>

            <table className="w-full">

              <thead className="bg-slate-800">

                <tr>

                  <th className="text-left p-5 text-slate-300">
                    File Name
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Type
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Uploaded By
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Date
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Status
                  </th>

                  <th className="text-left p-5 text-slate-300">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {evidence.map((item) => (
  <tr
    key={item.id}
    className="border-t border-slate-800 hover:bg-slate-800 transition"
  >
    <td className="p-5 text-white">
      {item.title}
    </td>

    <td className="p-5 text-slate-300">
      {item.evidence_type}
    </td>

    <td className="p-5 text-slate-300">
      {item.uploaded_by}
    </td>

    <td className="p-5 text-slate-300">
      {new Date(item.created_at).toLocaleDateString()}
    </td>

    <td className="p-5">
      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
        Uploaded
      </span>
    </td>

    <td className="p-5">
      <button
            onClick={() => setSelectedEvidence(item)}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-white"
>
  View
</button>
    </td>
  </tr>
))}

              </tbody>

            </table>

          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">
            {selectedEvidence ? (
              <div className="rounded-2xl bg-slate-800 p-6">

    <h3 className="text-2xl font-bold text-white mb-6">
      {selectedEvidence.title}
    </h3>

    {selectedEvidence.evidence_type.toLowerCase() === "image" && (
      <img
        src={`http://127.0.0.1:8000/uploads/${selectedEvidence.file_name}`}
        alt={selectedEvidence.title}
        className="w-full rounded-xl"
      />
    )}

    {selectedEvidence.evidence_type.toLowerCase() === "video" && (
      <video
        controls
        className="w-full rounded-xl"
      >
        <source
          src={`http://127.0.0.1:8000/uploads/${selectedEvidence.file_name}`}
        />
      </video>
    )}

    {selectedEvidence.evidence_type.toLowerCase() === "audio" && (
      <audio
        controls
        className="w-full"
      >
        <source
          src={`http://127.0.0.1:8000/uploads/${selectedEvidence.file_name}`}
        />
      </audio>
    )}

    {selectedEvidence.evidence_type.toLowerCase() === "document" && (
      <iframe
        title="Document Preview"
        src={`http://127.0.0.1:8000/uploads/${selectedEvidence.file_name}`}
        className="w-full h-[600px] rounded-xl"
      />
    )}

    <div className="mt-6 space-y-2 text-slate-300">
      <p>
        <strong>Uploaded By:</strong> {selectedEvidence.uploaded_by}
      </p>

      <p>
        <strong>Description:</strong> {selectedEvidence.description}
      </p>

      <p>
        <strong>Date:</strong>{" "}
        {new Date(selectedEvidence.created_at).toLocaleString()}
      </p>
    </div>

  </div>
) : (
  <div className="h-80 flex items-center justify-center text-slate-500">
    
  </div>
)}

            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-8"
            >

              <h2 className="text-2xl font-bold text-white">
                Export Evidence
              </h2>

              <p className="text-slate-400 mt-4">
                Download all evidence associated with this case.
              </p>

             <button
                onClick={() =>
                    window.open(
                    `http://127.0.0.1:8000/evidence/download/1`,
                    "_blank"
                    )
                }
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-white font-bold"
                >
  Download ZIP
</button>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-8"
            >

              <h2 className="text-2xl font-bold text-white">
                Generate Report
              </h2>

              <p className="text-slate-400 mt-4">
                Create a PDF containing all uploaded evidence and metadata.
              </p>

              <button
                    onClick={() =>
                        window.open(
                        "http://127.0.0.1:8000/reports/evidence/1",
                        "_blank"
                        )
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-white font-bold"
                    >
  Generate PDF
</button>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-8"
            >
              <h2 className="text-2xl font-bold text-white">Sync with AI</h2>
              <p className="text-slate-400 mt-4">
                Send all uploaded evidence to Visham AI for automatic summarization and pattern detection.
              </p>
              <button
                onClick={() => navigate("/ai", { state: { evidence } })}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 py-4 text-white font-bold"
              >
                Analyze with AI
              </button>
            </motion.div>

          </div>

          {/* Footer */}

          <div className="mt-12 text-center">

            <p className="text-slate-500">
              Visham Investigation Management System © 2026
            </p>

          </div>

        </main>

      </div>

    </div>

  );
}