import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

export default function Profile() {
  const { user, loading: authLoading, logout, getProfile } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
      } catch (err) {
        
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [getProfile]);

  if (authLoading || profileLoading) return <h2 className="p-6">Loading profile...</h2>;
  if (!user && !profileData) return <h2 className="p-6">Not logged in</h2>;

  const userData = profileData || user;
  
  return (
    <div className="p-6 max-w-md mx-auto border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Welcome, {userData.username} 👋</h2>
      <p><span className="font-semibold">Email:</span> {userData.email}</p>
      <p><span className="font-semibold">Role:</span> {userData.role}</p>
      <p><span className="font-semibold">User ID:</span> {userData.id}</p>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="mt-4 btn-danger"
      >
        Logout
      </button>
    </div>
  );
}
