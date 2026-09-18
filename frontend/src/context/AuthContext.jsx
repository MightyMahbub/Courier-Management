import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token") || null
  );

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const {
      user,
      access_token,
      refresh_token,
    } = response.data;

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "access_token",
      access_token
    );

    localStorage.setItem(
      "refresh_token",
      refresh_token
    );

    setUser(user);
    setAccessToken(access_token);

    return user;
  };

  const signup = async (
    name,
    email,
    password,
    phone
  ) => {
    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
      phone: phone || null,
    });

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}