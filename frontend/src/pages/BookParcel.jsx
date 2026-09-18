import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import api from "../services/api";

function BookParcel() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    category: "Document",
    weight_kg: "",
    price: "",
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

      await api.post("/parcels", {
        ...form,
        weight_kg: Number(form.weight_kg),
        price: Number(form.price),
      });

      toast.success("Parcel booked successfully!");

      navigate("/dashboard");

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to book parcel"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">

      <div className="max-w-2xl mx-auto">

        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">

            <h1 className="text-3xl font-bold text-primary">
              Book a Parcel
            </h1>

            <p className="opacity-70 mb-4">
              Enter the receiver and parcel details.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div>
                <label className="label">
                  <span className="label-text">
                    Receiver Name
                  </span>
                </label>

                <input
                  name="receiver_name"
                  className="input input-bordered w-full"
                  placeholder="Receiver name"
                  value={form.receiver_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">
                    Receiver Phone
                  </span>
                </label>

                <input
                  name="receiver_phone"
                  className="input input-bordered w-full"
                  placeholder="Receiver phone"
                  value={form.receiver_phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">
                    Receiver Address
                  </span>
                </label>

                <textarea
                  name="receiver_address"
                  className="textarea textarea-bordered w-full"
                  placeholder="Receiver address"
                  value={form.receiver_address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">
                    Category
                  </span>
                </label>

                <select
                  name="category"
                  className="select select-bordered w-full"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="Document">
                    Document
                  </option>

                  <option value="Fragile">
                    Fragile
                  </option>

                  <option value="Electronics">
                    Electronics
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="label">
                    <span className="label-text">
                      Weight (kg)
                    </span>
                  </label>

                  <input
                    name="weight_kg"
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="input input-bordered w-full"
                    placeholder="2.5"
                    value={form.weight_kg}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">
                      Price (৳)
                    </span>
                  </label>

                  <input
                    name="price"
                    type="number"
                    min="1"
                    className="input input-bordered w-full"
                    placeholder="350"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="flex gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading
                    ? "Booking..."
                    : "Book Parcel"}
                </button>

              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default BookParcel;