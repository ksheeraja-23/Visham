import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { getMySettings, saveMySettings } from "../services/settingsService";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  logoutAllDevices,
} from "../services/userService";
import { logout } from "../services/authService";

const defaultPrefs = {
  dark_mode: true,
  compact_view: false,
  font_size: "medium",
  accent_color: "cyan",
  notify_new_case: true,
  notify_new_evidence: true,
  notify_ai_complete: true,
  notify_report_generated: true,
  default_landing: "dashboard",
  default_graph_layout: "force",
  timeline_order: "newest",
  auto_expand_evidence: false,
};

export default function Settings() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", designation: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [infoModal, setInfoModal] = useState(null); // "guide" | "contact" | null

  useEffect(() => {
    (async () => {
      try {
        const res = await getMySettings();
        setPrefs({ ...defaultPrefs, ...res });
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const me = await getMyProfile();
        setProfile(me);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      await saveMySettings(prefs);
      toast.success("Preferences saved");
    } catch (err) {
      toast.error("Failed to save preferences");
    }
  };

  const handleReset = () => {
    setPrefs(defaultPrefs);
    toast("Reset to defaults");
  };

  function openEditProfile() {
    if (!profile) return;
    setProfileForm({
      full_name: profile.full_name || "",
      designation: profile.designation || "",
      email: profile.email || "",
    });
    setProfileError("");
    setEditProfileOpen(true);
  }

  async function submitEditProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    try {
      const updated = await updateMyProfile(profileForm);
      setProfile(updated);
      setEditProfileOpen(false);
      toast.success("Profile updated");
    } catch (err) {
      setProfileError(err?.response?.data?.detail || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  }

  function openChangePassword() {
    setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    setPasswordError("");
    setPasswordOpen(true);
  }

  async function submitChangePassword(e) {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await changeMyPassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordOpen(false);
      toast.success("Password changed. Please log in again.");
      logout();
      navigate("/");
    } catch (err) {
      setPasswordError(err?.response?.data?.detail || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogoutAll() {
    const confirmed = window.confirm(
      "This will sign you out of every device, including this one. Continue?"
    );
    if (!confirmed) return;
    try {
      await logoutAllDevices();
      toast.success("Logged out from all devices");
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      navigate("/");
    }
  }

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-black text-white">Settings</h1>
              <p className="text-slate-400 mt-1">Personalize Visham for your investigations.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Profile */}
            <motion.div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="text-xl text-white font-bold">My Profile</h2>
              <div className="mt-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {(profile?.full_name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold">{profile?.full_name || "—"}</div>
                  <div className="text-slate-400 text-sm">Username: {profile?.username || "—"}</div>
                  <div className="text-slate-400 text-sm">Designation: {profile?.designation || "—"}</div>
                  <div className="text-slate-400 text-sm">Role: {profile?.role || "—"}</div>
                  <div className="text-slate-400 text-sm">Email: {profile?.email || "—"}</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={openEditProfile} className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700">Edit Profile</button>
                    <button onClick={openChangePassword} className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700">Change Password</button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="text-xl text-white font-bold">Appearance</h2>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">Dark Mode</div>
                    <div className="text-slate-400 text-sm">Toggle dark interface</div>
                  </div>
                  <input type="checkbox" checked={prefs.dark_mode} onChange={(e)=>setPrefs({...prefs, dark_mode: e.target.checked})} />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">Compact View</div>
                    <div className="text-slate-400 text-sm">Enable compact layout for dense investigations</div>
                  </div>
                  <input type="checkbox" checked={prefs.compact_view} onChange={(e)=>setPrefs({...prefs, compact_view: e.target.checked})} />
                </div>

                <div>
                  <div className="text-white font-semibold">Font Size</div>
                  <select value={prefs.font_size} onChange={(e)=>setPrefs({...prefs, font_size: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-800 p-3 text-white">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <div className="text-white font-semibold">Accent Color</div>
                  <select value={prefs.accent_color} onChange={(e)=>setPrefs({...prefs, accent_color: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-800 p-3 text-white">
                    <option value="blue">Blue</option>
                    <option value="cyan">Cyan</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="text-xl text-white font-bold">Notifications</h2>
              <div className="mt-4 space-y-4">
                <label className="flex justify-between items-center">
                  <div>
                    <div className="text-white">New Case Assigned</div>
                    <div className="text-slate-400 text-sm">Receive alerts for new case assignments</div>
                  </div>
                  <input type="checkbox" checked={prefs.notify_new_case} onChange={(e)=>setPrefs({...prefs, notify_new_case: e.target.checked})} />
                </label>

                <label className="flex justify-between items-center">
                  <div>
                    <div className="text-white">New Evidence Added</div>
                    <div className="text-slate-400 text-sm">Get notified when evidence is uploaded</div>
                  </div>
                  <input type="checkbox" checked={prefs.notify_new_evidence} onChange={(e)=>setPrefs({...prefs, notify_new_evidence: e.target.checked})} />
                </label>

                <label className="flex justify-between items-center">
                  <div>
                    <div className="text-white">AI Analysis Complete</div>
                    <div className="text-slate-400 text-sm">Alerts when AI finishes processing evidence</div>
                  </div>
                  <input type="checkbox" checked={prefs.notify_ai_complete} onChange={(e)=>setPrefs({...prefs, notify_ai_complete: e.target.checked})} />
                </label>

                <label className="flex justify-between items-center">
                  <div>
                    <div className="text-white">Report Generated</div>
                    <div className="text-slate-400 text-sm">Notifications for generated reports</div>
                  </div>
                  <input type="checkbox" checked={prefs.notify_report_generated} onChange={(e)=>setPrefs({...prefs, notify_report_generated: e.target.checked})} />
                </label>
              </div>
            </motion.div>

            {/* Investigation Preferences */}
            <motion.div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="text-xl text-white font-bold">Investigation Preferences</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-white font-semibold">Default Landing Page</div>
                  <select value={prefs.default_landing} onChange={(e)=>setPrefs({...prefs, default_landing: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-800 p-3 text-white">
                    <option value="dashboard">Dashboard</option>
                    <option value="cases">Cases</option>
                    <option value="last">Last Opened Case</option>
                  </select>
                </div>

                <div>
                  <div className="text-white font-semibold">Default Graph Layout</div>
                  <select value={prefs.default_graph_layout} onChange={(e)=>setPrefs({...prefs, default_graph_layout: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-800 p-3 text-white">
                    <option value="hierarchical">Hierarchical</option>
                    <option value="force">Force Directed</option>
                  </select>
                </div>

                <div>
                  <div className="text-white font-semibold">Timeline Order</div>
                  <select value={prefs.timeline_order} onChange={(e)=>setPrefs({...prefs, timeline_order: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-800 p-3 text-white">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">Auto-expand Evidence Preview</div>
                    <div className="text-slate-400 text-sm">Automatically expand evidence when selecting nodes</div>
                  </div>
                  <input type="checkbox" checked={prefs.auto_expand_evidence} onChange={(e)=>setPrefs({...prefs, auto_expand_evidence: e.target.checked})} />
                </div>
              </div>
            </motion.div>

            {/* Security & Help */}
            <motion.div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="text-xl text-white font-bold">Security</h2>
              <div className="mt-4 space-y-3">
                <button onClick={openChangePassword} className="w-full rounded-2xl bg-slate-800 p-3 text-white hover:bg-slate-700">Change Password</button>
                <button onClick={handleLogoutAll} className="w-full rounded-2xl bg-red-600/80 p-3 text-white hover:bg-red-600">Logout from All Devices</button>
              </div>
              <h3 className="text-white font-semibold mt-6">Help & About</h3>
              <div className="mt-3 space-y-2 text-slate-400">
                <button onClick={() => setInfoModal("guide")} className="text-left w-full hover:text-white">User Guide</button>
                <button onClick={() => setInfoModal("contact")} className="text-left w-full hover:text-white">Contact Administrator</button>
                <div>Version: Visham v1.0.0</div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                <button onClick={() => setEditProfileOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>
              <form onSubmit={submitEditProfile} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-400">Full Name</label>
                  <input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Designation</label>
                  <input
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                {profileError && <p className="text-sm text-red-400">{profileError}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditProfileOpen(false)} className="flex-1 rounded-xl border border-slate-700 py-3 text-slate-300 hover:bg-slate-800">Cancel</button>
                  <button type="submit" disabled={profileSaving} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white disabled:opacity-50">
                    {profileSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {passwordOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Change Password</h2>
                <button onClick={() => setPasswordOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>
              <form onSubmit={submitChangePassword} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-400">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
                <p className="text-xs text-slate-500">Changing your password will sign you out of this device too — you'll need to log back in.</p>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPasswordOpen(false)} className="flex-1 rounded-xl border border-slate-700 py-3 text-slate-300 hover:bg-slate-800">Cancel</button>
                  <button type="submit" disabled={passwordSaving} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white disabled:opacity-50">
                    {passwordSaving ? "Saving..." : "Change Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal (User Guide / Contact Administrator) */}
      <AnimatePresence>
        {infoModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setInfoModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {infoModal === "guide" ? "User Guide" : "Contact Administrator"}
                </h2>
                <button onClick={() => setInfoModal(null)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>
              {infoModal === "guide" ? (
                <div className="mt-5 space-y-3 text-slate-300 leading-relaxed">
                  <p><span className="text-white font-semibold">Dashboard</span> — live case, evidence, and suspect counts, plus AI-generated investigation insights.</p>
                  <p><span className="text-white font-semibold">Cases</span> — create, search, filter, and manage every investigation.</p>
                  <p><span className="text-white font-semibold">Evidence</span> — upload files and view, download, or run AI summary / entity extraction on any item.</p>
                  <p><span className="text-white font-semibold">Suspect Board</span> — a live, Neo4j-backed relationship graph of suspects, witnesses, and evidence.</p>
                  <p><span className="text-white font-semibold">AI Workspace</span> — ask questions about a case, generate summaries, detect contradictions, and assess risk.</p>
                  <p><span className="text-white font-semibold">Reports</span> — export a complete investigation report as PDF or Word.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-2 text-slate-300">
                  <p>For account, access, or technical issues, reach the Visham system administrator:</p>
                  <p className="text-white font-semibold">admin@visham.local</p>
                  <p>Please include your username and a description of the issue.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}