import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import api from "../../api/axios";




export default function Profile() {
  const { user, loading: authLoading, getProfile, updateProfile, logout } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [form, setForm] = useState({ username: "", email: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOpen, setPwOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  // Username is always editable now

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
        setForm({ username: data.username, email: data.email });
      } catch {
        setErr("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (authLoading || profileLoading) return (
    <div className="py-12 text-center text-gray-500">Loading profile...</div>
  );
  if (!user && !profileData) return <div className="text-center py-12 text-lg">Not logged in</div>;

  // Fix: Only update local state after successful update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await updateProfile({ username: form.username });
      setMsg("Profile updated");
      setErr("");
      setProfileData((prev) => ({ ...prev, username: form.username }));
    } catch (error) {
      setErr(error.response?.data?.message || "Update failed");
      setMsg("");
    }
  };

  // Fix: Handle empty response for password change
  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwMsg(""); setPwErr(""); setPwLoading(true);
    try {
      await api.put("/user/profile/password", pwForm);
      setPwMsg("Password updated");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwErr(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Profile Settings</h2>
      {msg && <div className="mb-3 text-green-700">{msg}</div>}
      {err && <div className="mb-3 text-red-700">{err}</div>}
      <form className="space-y-5" onSubmit={handleProfileSave} autoComplete="off">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="w-32 font-medium">Name</label>
          <input
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="w-32 font-medium">Email</label>
          <input
            className="flex-1 px-3 py-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
            type="email"
            value={form.email}
            disabled
            readOnly
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Save</button>
        </div>
      </form>
      <div className="mt-10 border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        {pwMsg && <div className="text-green-700 mb-2">{pwMsg}</div>}
        {pwErr && <div className="text-red-700 mb-2">{pwErr}</div>}
        <form className="space-y-4 mt-2" onSubmit={handlePwSave} autoComplete="off">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="w-32 font-medium">Current Password</label>
            <input
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="w-32 font-medium">New Password</label>
            <input
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700" disabled={pwLoading}>{pwLoading ? "Saving..." : "Save Password"}</button>
          </div>
        </form>
      </div>
      <div className="mt-10 border-t pt-6">
        <button className="px-4 py-2 rounded bg-red-50 text-red-700 font-semibold hover:bg-red-100" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
