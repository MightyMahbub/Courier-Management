import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../services/api";


function Tracking() {
  const [trackingId, setTrackingId] = useState("");
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleTrack = async (e) => {
    e.preventDefault();

    if (!trackingId.trim()) {
      toast.error("Enter a tracking ID");
      return;
    }

    try {
      setLoading(true);
      setParcel(null);

      const response = await api.get(
        "/parcels",
        {
          params: {
            search: trackingId.trim(),
          },
        }
      );

      const results = response.data;

      if (!results || results.length === 0) {
        toast.error("No parcel found with this tracking ID");
        return;
      }

      const foundParcel = results.find(
        (item) =>
          item.tracking_id.toLowerCase() ===
          trackingId.trim().toLowerCase()
      );

      if (!foundParcel) {
        toast.error("Tracking ID not found");
        return;
      }

      setParcel(foundParcel);

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to track parcel"
      );
    } finally {
      setLoading(false);
    }
  };


  const getStatusText = (status) => {
    const names = {
      pending: "Pending",
      picked_up: "Picked Up",
      in_transit: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return names[status] || status;
  };


  const getStatusIcon = (status) => {
    if (status === "pending") {
      return <FaClock />;
    }

    if (status === "picked_up") {
      return <FaBox />;
    }

    if (status === "in_transit") {
      return <FaTruck />;
    }

    if (status === "delivered") {
      return <FaCheckCircle />;
    }

    if (status === "cancelled") {
      return <FaTimesCircle />;
    }

    return <FaBox />;
  };


  const getStatusColor = (status) => {
    const colors = {
      pending: "badge-warning",
      picked_up: "badge-info",
      in_transit: "badge-info",
      delivered: "badge-success",
      cancelled: "badge-error",
    };

    return colors[status] || "badge-neutral";
  };


  const getStepClass = (
    currentStatus,
    step
  ) => {

    const order = {
      pending: 1,
      picked_up: 2,
      in_transit: 3,
      delivered: 4,
    };

    if (currentStatus === "cancelled") {
      return "";
    }

    return order[currentStatus] >= step
      ? "step-primary"
      : "";
  };


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


        <Link
          to="/dashboard"
          className="btn btn-ghost btn-sm"
        >
          Dashboard
        </Link>

      </div>


      {/* MAIN */}

      <main className="max-w-4xl mx-auto p-6">


        {/* HEADER */}

        <div className="text-center mt-8 mb-8">

          <div className="flex justify-center mb-4">

            <div className="bg-primary/10 p-5 rounded-full text-primary">

              <FaTruck size={42} />

            </div>

          </div>


          <h1 className="text-4xl font-bold">
            Track Your Parcel
          </h1>


          <p className="opacity-70 mt-2">
            Enter your tracking ID to check your shipment status.
          </p>

        </div>


        {/* SEARCH */}

        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">

            <form
              onSubmit={handleTrack}
              className="flex flex-col sm:flex-row gap-3"
            >

              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="Enter tracking ID e.g. CL-D431FFBA"
                value={trackingId}
                onChange={(e) =>
                  setTrackingId(e.target.value)
                }
              />


              <button
                type="submit"
                className="btn btn-primary sm:w-32"
                disabled={loading}
              >

                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <FaSearch />
                    Track
                  </>
                )}

              </button>

            </form>

          </div>

        </div>


        {/* RESULT */}

        {parcel && (

          <div className="mt-6 space-y-6">


            {/* TRACKING RESULT */}

            <div className="card bg-base-100 shadow-xl">

              <div className="card-body">


                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">


                  <div>

                    <p className="text-sm opacity-60">
                      Tracking ID
                    </p>

                    <h2 className="text-2xl font-bold font-mono text-primary">
                      {parcel.tracking_id}
                    </h2>

                  </div>


                  <div
                    className={`badge ${getStatusColor(
                      parcel.status
                    )} gap-2 p-4`}
                  >

                    {getStatusIcon(parcel.status)}

                    {getStatusText(
                      parcel.status
                    )}

                  </div>

                </div>

              </div>

            </div>


            {/* PROGRESS */}

            <div className="card bg-base-100 shadow-xl">

              <div className="card-body">

                <h2 className="card-title">
                  Shipment Progress
                </h2>


                {parcel.status === "cancelled" ? (

                  <div className="alert alert-error mt-4">

                    <FaTimesCircle />

                    <span>
                      This parcel has been cancelled.
                    </span>

                  </div>

                ) : (

                  <ul className="steps steps-vertical md:steps-horizontal w-full mt-5">

                    <li
                      className={`step ${getStepClass(
                        parcel.status,
                        1
                      )}`}
                    >
                      Pending
                    </li>


                    <li
                      className={`step ${getStepClass(
                        parcel.status,
                        2
                      )}`}
                    >
                      Picked Up
                    </li>


                    <li
                      className={`step ${getStepClass(
                        parcel.status,
                        3
                      )}`}
                    >
                      In Transit
                    </li>


                    <li
                      className={`step ${getStepClass(
                        parcel.status,
                        4
                      )}`}
                    >
                      Delivered
                    </li>

                  </ul>

                )}

              </div>

            </div>


            {/* DETAILS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              <div className="card bg-base-100 shadow-xl">

                <div className="card-body">

                  <h2 className="card-title">
                    <FaBox className="text-primary" />
                    Parcel Details
                  </h2>


                  <div className="divider"></div>


                  <div className="space-y-4">


                    <div className="flex justify-between">

                      <span className="opacity-60">
                        Receiver
                      </span>

                      <span className="font-semibold">
                        {parcel.receiver_name}
                      </span>

                    </div>


                    <div className="flex justify-between">

                      <span className="opacity-60">
                        Category
                      </span>

                      <span className="font-semibold">
                        {parcel.category}
                      </span>

                    </div>


                    <div className="flex justify-between">

                      <span className="opacity-60">
                        Weight
                      </span>

                      <span className="font-semibold">
                        {parcel.weight_kg} kg
                      </span>

                    </div>


                    <div className="flex justify-between">

                      <span className="opacity-60">
                        Price
                      </span>

                      <span className="font-semibold">
                        ৳{parcel.price}
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              <div className="card bg-base-100 shadow-xl">

                <div className="card-body">

                  <h2 className="card-title">
                    Delivery Information
                  </h2>


                  <div className="divider"></div>


                  <div className="space-y-4">


                    <div>

                      <p className="text-sm opacity-60">
                        Receiver Phone
                      </p>

                      <p className="font-semibold">
                        {parcel.receiver_phone}
                      </p>

                    </div>


                    <div>

                      <p className="text-sm opacity-60">
                        Delivery Address
                      </p>

                      <p className="font-semibold">
                        {parcel.receiver_address}
                      </p>

                    </div>


                    <div>

                      <p className="text-sm opacity-60">
                        Assigned Agent
                      </p>

                      <p className="font-semibold">

                        {parcel.agent_id
                          ? `Agent #${parcel.agent_id}`
                          : "Not assigned"}

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* VIEW FULL DETAILS */}

            <div className="text-center">

              <Link
                to={`/parcels/${parcel.id}`}
                className="btn btn-primary"
              >

                View Full Parcel Details

                <FaArrowRight />

              </Link>

            </div>


          </div>

        )}

      </main>

    </div>
  );
}


export default Tracking;