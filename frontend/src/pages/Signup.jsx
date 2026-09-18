import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await signup(
        form.name,
        form.email,
        form.password,
        form.phone
      );

      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            <input
              name="name"
              type="text"
              className="input input-bordered w-full"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              className="input input-bordered w-full"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              type="text"
              className="input input-bordered w-full"
              placeholder="Phone number (optional)"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              className="input input-bordered w-full"
              placeholder="Password"
              minLength="6"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;