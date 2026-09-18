import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaBox,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../services/api";


function EditParcel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [parcel, setParcel] = useState(null);

  const [formData, setFormData] = useState({
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    category: "Document",
    weight_kg: "",
    price: "",
  });


  // =====================================================
  // FETCH PARCEL
  // =====================================================

  const fetchParcel = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/parcels/${id}`
      );

      const data = response.data;

      // User can only edit pending parcels
      if (data.status !== "pending") {
        toast.error(
          "Only pending parcels can be edited."
        );

        navigate(`/parcels/${id}`);
        return;
      }

      setParcel(data);

      setFormData({
        receiver_name: data.receiver_name || "",
        receiver_phone: data.receiver_phone || "",
        receiver_address: data.receiver_address || "",
        category: data.category || "Document",
        weight_kg: data.weight_kg || "",
        price: data.price || "",
      });

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load parcel"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchParcel();
  }, [id]);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.receiver_name.trim()) {
      toast.error("Enter receiver name");
      return;
    }

    if (!formData.receiver_phone.trim()) {
      toast.error("Enter receiver phone");
      return;
    }

    if (!formData.receiver_address.trim()) {
      toast.error("Enter receiver address");
      return;
    }

    if (
      !formData.weight_kg ||
      Number(formData.weight_kg) <= 0
    ) {
      toast.error("Enter a valid weight");
      return;
    }

    if (
      !formData.price ||
      Number(formData.price) <= 0
    ) {
      toast.error("Enter a valid price");
      return;
    }


    try {
      setSaving(true);

      await api.put(
        `/parcels/${id}`,
        {
          receiver_name:
            formData.receiver_name.trim(),

          receiver_phone:
            formData.receiver_phone.trim(),

          receiver_address:
            formData.receiver_address.trim(),

          category:
            formData.category,

          weight_kg:
            Number(formData.weight_kg),

          price:
            Number(formData.price),
        }
      );

      toast.success(
        "Parcel updated successfully!"
      );

      navigate(`/parcels/${id}`);

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to update parcel"
      );
    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">

        <span className="loading loading-spinner loading-lg text-primary"></span>

      </div>
    );
  }


  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!parcel) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-3xl font-bold mb-4">
            Parcel Not Found
          </h1>

          <Link
            to="/dashboard"
            className="btn btn-primary"
          >
            Back to Dashboard
          </Link>

        </div>

      </div>
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-base-200">


      {/* NAVBAR */}

      <div className="navbar bg-base-100 shadow-md px-6">

        <div className="flex-1">

          <Link
            to="/dashboard"
            className="text-xl font-bold text-primary"
          >
            Courier & Logistics
          </Link>

        </div>

      </div>


      {/* MAIN */}

      <main className="max-w-3xl mx-auto p-6">


        {/* BACK */}

        <Link
          to={`/parcels/${id}`}
          className="btn btn-ghost mb-5"
        >
          <FaArrowLeft />
          Back to Parcel
        </Link>


        {/* HEADER */}

        <div className="mb-6">

          <h1 className="text-3xl font-bold">
            Edit Parcel
          </h1>

          <p className="opacity-70 mt-1">
            Update the information for your pending parcel.
          </p>

        </div>


        {/* TRACKING INFO */}

        <div className="alert bg-base-100 shadow mb-6">

          <FaBox className="text-primary" />

          <div>

            <p className="text-sm opacity-60">
              Tracking ID
            </p>

            <p className="font-mono font-bold text-primary">
              {parcel.tracking_id}
            </p>

          </div>

        </div>


        {/* FORM */}

        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >


              {/* RECEIVER NAME */}

              <div>

                <label className="label">

                  <span className="label-text font-semibold">
                    Receiver Name
                  </span>

                </label>

                <input
                  type="text"
                  name="receiver_name"
                  className="input input-bordered w-full"
                  placeholder="Enter receiver name"
                  value={formData.receiver_name}
                  onChange={handleChange}
                />

              </div>


              {/* PHONE */}

              <div>

                <label className="label">

                  <span className="label-text font-semibold">
                    Receiver Phone
                  </span>

                </label>

                <input
                  type="text"
                  name="receiver_phone"
                  className="input input-bordered w-full"
                  placeholder="Enter receiver phone"
                  value={formData.receiver_phone}
                  onChange={handleChange}
                />

              </div>


              {/* ADDRESS */}

              <div>

                <label className="label">

                  <span className="label-text font-semibold">
                    Receiver Address
                  </span>

                </label>

                <textarea
                  name="receiver_address"
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter delivery address"
                  rows="3"
                  value={formData.receiver_address}
                  onChange={handleChange}
                />

              </div>


              {/* CATEGORY */}

              <div>

                <label className="label">

                  <span className="label-text font-semibold">
                    Category
                  </span>

                </label>

                <select
                  name="category"
                  className="select select-bordered w-full"
                  value={formData.category}
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


              {/* WEIGHT + PRICE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                <div>

                  <label className="label">

                    <span className="label-text font-semibold">
                      Weight (kg)
                    </span>

                  </label>

                  <input
                    type="number"
                    name="weight_kg"
                    min="0.1"
                    step="0.1"
                    className="input input-bordered w-full"
                    placeholder="2"
                    value={formData.weight_kg}
                    onChange={handleChange}
                  />

                </div>


                <div>

                  <label className="label">

                    <span className="label-text font-semibold">
                      Price (৳)
                    </span>

                  </label>

                  <input
                    type="number"
                    name="price"
                    min="1"
                    step="1"
                    className="input input-bordered w-full"
                    placeholder="500"
                    value={formData.price}
                    onChange={handleChange}
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">


                <Link
                  to={`/parcels/${id}`}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </Link>


                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}

                </button>

              </div>


            </form>

          </div>

        </div>


      </main>

    </div>
  );
}


export default EditParcel;