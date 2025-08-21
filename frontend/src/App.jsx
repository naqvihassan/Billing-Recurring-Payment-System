import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/authContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/user/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import UserDashboard from "./pages/user/Dashboard";

function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="p-4 bg-gray-900 text-white">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold nav-link">Home</Link>
          {user ? (
            <>
              <Link to="/profile" className="nav-link">Profile</Link>
              {user.role === "admin" ? (
                <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
              ) : (
                <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Signup</Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm text-gray-200">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="btn-danger text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const RequireAuth = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <h2 className="p-6">Loading...</h2>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  const RequireAdmin = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <h2 className="p-6">Loading...</h2>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/" replace />;
    return children;
  };

  return (
    <AuthProvider>
      <Router>
        <NavBar />

        <Routes>
          <Route path="/" element={<h1 className="text-3xl font-bold">Welcome</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/user/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/user/profile" element={<Navigate to="/profile" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
