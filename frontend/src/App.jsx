import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import BookParcel from "./pages/BookParcel";
import ParcelDetails from "./pages/ParcelDetails";
import EditParcel from "./pages/EditParcel";
import Tracking from "./pages/Tracking";

import { AuthProvider, useAuth } from "./context/AuthContext";


function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}


function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>


      {/* AUTH */}

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin"
                  : "/dashboard"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />


      <Route
        path="/signup"
        element={
          user ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Signup />
          )
        }
      />


      <Route
        path="/forgot-password"
        element={
          <ForgotPassword />
        }
      />


      <Route
        path="/reset-password"
        element={
          <ResetPassword />
        }
      />


      {/* USER DASHBOARD */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />


      {/* BOOK PARCEL */}

      <Route
        path="/book-parcel"
        element={
          <ProtectedRoute>
            <BookParcel />
          </ProtectedRoute>
        }
      />


      {/* PARCEL DETAILS */}

      <Route
        path="/parcels/:id"
        element={
          <ProtectedRoute>
            <ParcelDetails />
          </ProtectedRoute>
        }
      />


      {/* EDIT PARCEL */}

      <Route
        path="/parcels/:id/edit"
        element={
          <ProtectedRoute>
            <EditParcel />
          </ProtectedRoute>
        }
      />


      {/* TRACKING */}

      <Route
        path="/tracking"
        element={
          <ProtectedRoute>
            <Tracking />
          </ProtectedRoute>
        }
      />


      {/* ADMIN */}

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />


      {/* DEFAULT */}

      <Route
        path="/"
        element={
          <Navigate
            to={
              user
                ? user.role === "admin"
                  ? "/admin"
                  : "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />


      {/* 404 */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <AppRoutes />

      </AuthProvider>

    </BrowserRouter>
  );
}


export default App;