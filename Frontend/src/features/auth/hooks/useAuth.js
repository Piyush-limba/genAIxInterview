import { useContext, } from "react";
import { authContext } from "../auth.context.jsx";
import {
  register,
  login,
  logout,
  
} from "../services/auth.api.js";

export const useAuth = () => {
  const context = useContext(authContext);
  const { user, setUser, setLoading, loading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      setUser(data.user);
    } catch (error) {
      console.error("Register failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };


    return { handleLogin, handleRegister, handleLogout, user, loading };
};
