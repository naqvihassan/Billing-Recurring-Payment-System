import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      api.get("/user/profile")
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          setUser(null);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await api.post("/auth/signup", { username, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const getProfile = async () => {
    try {
      const res = await api.get("/user/profile");
      setUser(res.data);
      return res.data;
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put("/user/profile", profileData);
      setUser(res.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      getProfile,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};