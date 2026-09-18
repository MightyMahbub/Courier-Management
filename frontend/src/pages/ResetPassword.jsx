import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-hot-toast";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });

      toast.success("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Reset link is invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary">
            Reset Password
          </h1>

          {!token ? (
            <>
              <div className="alert alert-error mt-5">
                Invalid or missing reset token.
              </div>

              <Link
                to="/forgot-password"
                className="btn btn-primary mt-4"
              >
                Request New Link
              </Link>
            </>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 mt-6"
            >
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="6"
                required
              />

              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                minLength="6"
                required
              />

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;