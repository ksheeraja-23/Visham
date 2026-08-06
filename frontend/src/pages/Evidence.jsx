import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import {
  UploadCloud,
  FileText,
  Image,
  Video,
  Music,
  BrainCircuit,
  CheckCircle2,
  Download,
  Trash2,
  X,
  Tags,
} from "lucide-react";
import api from "../services/api";

import {
  uploadEvidence,
  getEvidence,
} from "../services/evidenceService";
import { getCases } from "../services/caseService";

const FILE_BASE_URL = "http://127.0.0.1:8000/uploads/";

function detectKind(evidenceType = "") {
  const t = evidenceType.toLowerCase();
  if (t.includes("image")) return "image";
  if (t.includes("video")) return "video";
  if (t.includes("audio")) return "audio";
  if (t.includes("pdf")) return "pdf";
  return "other";
}

export default function Evidence() {

  const inputRef = useRef(null);

  const [file, setFile] = useState(null);

  const [dragging, setDragging] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [evidenceList, setEvidenceList] = useState([]);

  const [cases, setCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(1);

  async function loadEvidence() {

    try {

      const data = await getEvidence();

      setEvidenceList(data);

    } catch (err) {

      console.log(err);

    }

  }

  useEffect(() => {

    loadEvidence();

    (async () => {
      try {
        const caseList = await getCases();
        setCases(caseList || []);
        if (caseList && caseList.length > 0) {
          setActiveCaseId(caseList[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    })();

  }, []);

  const [previewEvidence, setPreviewEvidence] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisMode, setAnalysisMode] = useState(null); // "summary" | "entities"
  const [analyzing, setAnalyzing] = useState(false);

  async function uploadToServer(selectedFile) {

    try {

      setUploading(true);

      setProgress(0);

      await uploadEvidence(

        selectedFile,

        {

          case_id: activeCaseId,

          title: selectedFile.name,

          description: "Uploaded from Visham",

          evidence_type: selectedFile.type,

          uploaded_by: "Admin",

        },

        (percent) => {

          setProgress(percent);

        }

      );

      await loadEvidence();

    } catch (err) {

      console.log(err);

    } finally {

      setUploading(false);

    }

  }

  async function handleDelete(id) {
    try {
      await api.delete(`/evidence/${id}`);
      await loadEvidence();
    } catch (err) {
      console.error(err);
    }
  }

  function handleView(item) {
    setPreviewEvidence(item);
    setViewerOpen(true);
  }

  async function handleAnalyze(item, mode) {
    if (!item) return;
    setPreviewEvidence(item);
    setAnalysisMode(mode);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await api.post(`/evidence/${item.id}/analyze`);
      const updated = response.data;

      // keep the list in sync so re-opening shows cached results without re-analyzing
      setEvidenceList((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      setPreviewEvidence(updated);

      if (mode === "summary") {
        setAnalysis(updated.ai_summary || "No summary returned.");
      } else {
        let entities = [];
        try {
          entities = JSON.parse(updated.ai_entities || "[]");
        } catch {
          entities = [];
        }
        setAnalysis(entities);
      }
    } catch (err) {
      console.error(err);
      setAnalysis(mode === "summary" ? "AI summary failed. Please try again." : []);
    } finally {
      setAnalyzing(false);
    }
  }

  function downloadUrl(item) {
    return `http://127.0.0.1:8000/evidence/${item.id}/download`;
  }

  function selectFile(e) {

    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);

    uploadToServer(selected);

  }

  return (

    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-10 space-y-8">

          <div>

            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

              Evidence Workspace

            </h1>

            <p className="text-slate-400 mt-3">

              Upload, organize and analyze investigation evidence.

            </p>

          </div>

          <motion.div

            whileHover={{
              scale: 1.01,
            }}

            onDragOver={(e) => {

              e.preventDefault();

              setDragging(true);

            }}

            onDragLeave={() => {

              setDragging(false);

            }}

            onDrop={(e) => {

              e.preventDefault();

              setDragging(false);

              const selected = e.dataTransfer.files[0];

              if (!selected) return;

              setFile(selected);

              uploadToServer(selected);

            }}

            onClick={() => inputRef.current.click()}

            className={`cursor-pointer rounded-3xl border-2 border-dashed p-16 transition-all duration-300

            ${dragging

            ? "border-cyan-500 bg-cyan-500/10"

            : "border-slate-700 bg-slate-900"

            }`}

          >

            <input

              hidden

              ref={inputRef}

              type="file"

              onChange={selectFile}

            />

            <UploadCloud

              size={75}

              className="mx-auto text-cyan-400"

            />

            <h2 className="mt-8 text-center text-3xl font-bold text-white">

              Drag & Drop Evidence

            </h2>

            <p className="mt-3 text-center text-slate-400">

              Images • PDF • Video • Audio

            </p>

          </motion.div>

          {file && (

            <motion.div

              initial={{
                opacity:0,
                y:20
              }}

              animate={{
                opacity:1,
                y:0
              }}

              className="rounded-3xl border border-slate-800 bg-slate-900 p-8"

            >

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold text-white">

                    Latest Upload

                  </h2>

                  <p className="mt-2 text-slate-400">

                    {file.name}

                  </p>

                </div>

                <CheckCircle2

                  className="text-green-400"

                  size={40}

                />

              </div>

              {uploading ? (

                <>

                  <div className="mt-8 h-3 w-full rounded-full bg-slate-800">

                    <div

                      style={{
                        width: `${progress}%`,
                      }}

                      className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"

                    />

                  </div>

                  <p className="mt-4 text-cyan-400">

                    Uploading...

                    {" "}

                    {progress}%

                  </p>

                </>

              ) : (

                <div className="mt-8 grid grid-cols-4 gap-5">

                  <div className="rounded-2xl bg-slate-800 p-6">

                    <Image className="text-cyan-400"/>

                    <h3 className="mt-4 text-white">

                      Images

                    </h3>

                  </div>

                  <div className="rounded-2xl bg-slate-800 p-6">

                    <FileText className="text-green-400"/>

                    <h3 className="mt-4 text-white">

                      Documents

                    </h3>

                  </div>

                  <div className="rounded-2xl bg-slate-800 p-6">

                    <Video className="text-red-400"/>

                    <h3 className="mt-4 text-white">

                      Videos

                    </h3>

                  </div>

                  <div className="rounded-2xl bg-slate-800 p-6">

                    <Music className="text-yellow-400"/>

                    <h3 className="mt-4 text-white">

                      Audio

                    </h3>

                  </div>

                </div>

              )}

            </motion.div>

          )}
                  <div className="grid grid-cols-3 gap-6">

            <div className="col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-2xl font-bold text-white">

                  Uploaded Evidence

                </h2>

                <span className="text-slate-400">

                  {evidenceList.length} Files

                </span>

              </div>

              {evidenceList.length === 0 ? (

                <div className="py-16 text-center">

                  <UploadCloud
                    size={60}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-5 text-slate-500">

                    No evidence uploaded yet.

                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {evidenceList.map((item, index) => (

                    <motion.div
                      key={item.id}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      whileHover={{
                        scale: 1.01,
                      }}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/60 p-5"
                    >

                      <div className="flex items-center gap-5">

                        {item.evidence_type?.includes("image") ? (

                          <Image
                            size={32}
                            className="text-cyan-400"
                          />

                        ) : item.evidence_type?.includes("pdf") ? (

                          <FileText
                            size={32}
                            className="text-green-400"
                          />

                        ) : item.evidence_type?.includes("video") ? (

                          <Video
                            size={32}
                            className="text-red-400"
                          />

                        ) : (

                          <Music
                            size={32}
                            className="text-yellow-400"
                          />

                        )}

                        <div>

                          <h3 className="text-white font-semibold">

                            {item.title}

                          </h3>

                          <p className="text-slate-400 text-sm mt-1">

                            {item.description}

                          </p>

                        </div>

                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => handleView(item)} className="rounded-xl bg-cyan-600 p-3 hover:bg-cyan-700 transition">
                          <BrainCircuit className="text-white" size={18} />
                        </button>

                        <a
                          href={downloadUrl(item)}
                          className="rounded-xl bg-blue-600 p-3 hover:bg-blue-700 transition"
                        >

                          <Download
                            className="text-white"
                            size={18}
                          />

                        </a>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-xl bg-red-600 p-3 hover:bg-red-700 transition"
                        >

                          <Trash2
                            className="text-white"
                            size={18}
                          />

                        </button>

                      </div>

                    </motion.div>

                  ))}

                </div>

              )}

            </div>

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-6"
            >

              <BrainCircuit
                size={48}
                className="text-white"
              />

              <h2 className="mt-6 text-3xl font-bold text-white">

                AI Evidence Analyzer

              </h2>

              <p className="mt-3 text-blue-100 leading-7">

                {previewEvidence
                  ? `Selected: ${previewEvidence.title}`
                  : "Select an evidence item to run AI analysis on it."}

              </p>

              <div className="mt-6 flex flex-col gap-3">

                <button
                  onClick={() => handleAnalyze(previewEvidence, "summary")}
                  disabled={!previewEvidence || analyzing}
                  className="w-full rounded-2xl bg-white py-4 font-bold text-slate-900 hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
                >
                  {analyzing && analysisMode === "summary" ? "Analyzing..." : "AI Summary"}
                </button>

                <button
                  onClick={() => handleAnalyze(previewEvidence, "entities")}
                  disabled={!previewEvidence || analyzing}
                  className="w-full rounded-2xl bg-slate-900/70 py-4 font-bold text-white hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
                >
                  {analyzing && analysisMode === "entities" ? "Extracting..." : "Entity Extraction"}
                </button>

              </div>

              {analysis && !analyzing && analysisMode === "summary" && (
                <div className="mt-6 rounded-2xl bg-slate-900/70 p-4 text-sm text-white">
                  <h3 className="font-semibold">AI Summary</h3>
                  <p className="mt-2 whitespace-pre-wrap text-slate-200">{analysis}</p>
                </div>
              )}

              {analysis && !analyzing && analysisMode === "entities" && (
                <div className="mt-6 rounded-2xl bg-slate-900/70 p-4 text-sm text-white">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Tags size={16} /> Extracted Entities
                  </h3>
                  {Array.isArray(analysis) && analysis.length > 0 ? (
                    <ul className="mt-3 space-y-1">
                      {analysis.map((ent, i) => (
                        <li key={i} className="text-slate-200">
                          {typeof ent === "string"
                            ? ent
                            : `${ent.type || "Entity"}: ${ent.value || ""}`}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-slate-400">No entities extracted.</p>
                  )}
                </div>
              )}

            </motion.div>

          </div>

        </main>

      </div>

      <AnimatePresence>
        {viewerOpen && previewEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setViewerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{previewEvidence.title}</h2>
                <button onClick={() => setViewerOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <p className="mt-2 text-slate-400">{previewEvidence.description}</p>

              <div className="mt-6 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[300px]">
                {(() => {
                  const kind = detectKind(previewEvidence.evidence_type);
                  const src = `${FILE_BASE_URL}${previewEvidence.file_name}`;

                  if (kind === "image") {
                    return <img src={src} alt={previewEvidence.title} className="max-h-[60vh] w-auto object-contain" />;
                  }
                  if (kind === "video") {
                    return (
                      <video controls className="max-h-[60vh] w-full">
                        <source src={src} />
                        Your browser does not support video playback.
                      </video>
                    );
                  }
                  if (kind === "audio") {
                    return (
                      <div className="w-full p-10">
                        <Music size={60} className="mx-auto text-yellow-400 mb-6" />
                        <audio controls className="w-full">
                          <source src={src} />
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    );
                  }
                  if (kind === "pdf") {
                    return (
                      <iframe
                        src={src}
                        title={previewEvidence.title}
                        className="w-full h-[60vh]"
                      />
                    );
                  }
                  return (
                    <div className="p-10 text-center">
                      <FileText size={60} className="mx-auto text-slate-500 mb-4" />
                      <p className="text-slate-400">
                        No inline preview available for this file type.
                      </p>
                      <a
                        href={downloadUrl(previewEvidence)}
                        className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                      >
                        Download to view
                      </a>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={downloadUrl(previewEvidence)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                  <Download size={16} /> Download
                </a>
                <button
                  onClick={() => {
                    setViewerOpen(false);
                    handleAnalyze(previewEvidence, "summary");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-white hover:bg-cyan-700"
                >
                  <BrainCircuit size={16} /> AI Summary
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>

  );

}