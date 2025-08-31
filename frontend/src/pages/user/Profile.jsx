import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/authContext";
import api from "../../api/axios";




export default function Profile() {
  const { user, loading: authLoading, getProfile, updateProfile, logout, refreshUser } = useContext(AuthContext);
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
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoMsg, setPhotoMsg] = useState("");
  const [photoErr, setPhotoErr] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
        setForm({ username: data.username, email: data.email });
        if (data.photo) {
          setPhotoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${data.photo}`);
        }
      } catch {
        setErr("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);
  // Handle photo file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoMsg("");
      setPhotoErr("");
    }
  };

  // Upload photo to backend
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setPhotoUploading(true);
    setPhotoMsg("");
    setPhotoErr("");
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      const res = await api.post("/user/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoMsg("Photo updated");
      setPhotoErr("");
      setPhotoFile(null);
      // Update preview to new photo from server
      setPhotoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${res.data.photo}`);
      // Update profileData and context
      setProfileData((prev) => ({ ...prev, photo: res.data.photo }));
      if (typeof refreshUser === 'function') await refreshUser();
    } catch (err) {
      setPhotoErr(err.response?.data?.message || "Failed to upload photo");
      setPhotoMsg("");
    } finally {
      setPhotoUploading(false);
    }
  };

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
      {/* Photo upload section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <span className="text-3xl text-gray-400">👤</span>
            )}
          </div>
          <form onSubmit={handlePhotoUpload} className="mt-3 flex flex-col items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={photoUploading}
            >
              {photoFile ? "Change Photo" : "Upload Photo"}
            </button>
            {photoFile && (
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                disabled={photoUploading}
              >
                {photoUploading ? "Uploading..." : "Save Photo"}
              </button>
            )}
            {photoMsg && <div className="text-green-700 text-xs mt-1">{photoMsg}</div>}
            {photoErr && <div className="text-red-700 text-xs mt-1">{photoErr}</div>}
          </form>
        </div>
        <form className="flex-1 space-y-5" onSubmit={handleProfileSave} autoComplete="off">
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
      </div>
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
