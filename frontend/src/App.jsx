import { useContext, useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/authContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/user/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFeatures from "./pages/admin/Features";
import AdminPlans from "./pages/admin/Plans";
import UserDashboard from "./pages/user/Dashboard";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const adminDropdownRef = useRef(null);

  // Close dropdowns when clicking outside (use click to avoid interfering with link navigation)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  const NavItem = ({ to, children, onClick, className = "" }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 text-sm font-medium ${
          isActive
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-700 hover:text-blue-600"
        } ${className}`
      }
      onClick={onClick}
    >
      {children}
    </NavLink>
  );

  const DropdownItem = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );

  const userDisplayName = user?.username || user?.email?.split('@')[0] || "User";
  const userInitials = (user?.username || user?.email || "U")
    .split(/\s+|\./)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-200">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BillSync
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <NavItem to="/profile">
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </NavItem>
                  
                  {user.role === "admin" ? (
                    <div className="relative" ref={adminDropdownRef}>
                      <button
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                        onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                      >
                        Admin
                        <svg className={`ml-1 h-4 w-4 ${adminDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {adminDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow border border-gray-200 py-1 z-50">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setAdminDropdownOpen(false);
                              navigate('/admin/dashboard');
                            }}
                          >
                            Dashboard
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setAdminDropdownOpen(false);
                              navigate('/admin/features');
                            }}
                          >
                            Features
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setAdminDropdownOpen(false);
                              navigate('/admin/plans');
                            }}
                          >
                            Plans
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavItem to="/user/dashboard">
                      Dashboard
                    </NavItem>
                  )}
                </>
              ) : (
                <>
                  <NavItem to="/login">Login</NavItem>
                  <Link
                    to="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-semibold text-white">{userInitials}</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {userDisplayName}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                  <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <DropdownItem
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    >
                      Profile Settings
                    </DropdownItem>
                    <div className="border-t border-gray-100 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-4 border-b border-gray-100">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-semibold text-white">{userInitials}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{userDisplayName}</div>
                      <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                    </div>
                  </div>
                  
                  <NavItem to="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                    Profile
                  </NavItem>
                  
                  {user.role === "admin" ? (
                    <>
                      <NavItem to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                        Admin Dashboard
                      </NavItem>
                      <NavItem to="/admin/features" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                        Features
                      </NavItem>
                      <NavItem to="/admin/plans" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                        Plans
                      </NavItem>
                    </>
                  ) : (
                    <NavItem to="/user/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                      Dashboard
                    </NavItem>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                    Login
                  </NavItem>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
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
          <Route path="/admin/features" element={<RequireAdmin><AdminFeatures /></RequireAdmin>} />
          <Route path="/admin/plans" element={<RequireAdmin><AdminPlans /></RequireAdmin>} />
          <Route path="/user/profile" element={<Navigate to="/profile" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;