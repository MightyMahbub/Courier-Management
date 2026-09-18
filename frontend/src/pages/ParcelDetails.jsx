import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBox,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaWeightHanging,
  FaMoneyBillWave,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../services/api";


function ParcelDetails() {
  const { id } = useParams();

  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchParcel = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/parcels/${id}`
      );

      setParcel(response.data);

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


  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">

        <span className="loading loading-spinner loading-lg text-primary"></span>

      </div>
    );
  }


  if (!parcel) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-3xl font-bold mb-3">
            Parcel Not Found
          </h1>

          <p className="opacity-70 mb-5">
            The parcel could not be found.
          </p>

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

      <main className="max-w-5xl mx-auto p-6">


        {/* BACK */}

        <Link
          to="/dashboard"
          className="btn btn-ghost mb-5"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>


        {/* HEADER */}

        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">


            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">


              <div>

                <p className="text-sm opacity-60">
                  Tracking ID
                </p>

                <h1 className="text-3xl font-bold font-mono text-primary">
                  {parcel.tracking_id}
                </h1>

              </div>


              <div
                className={`badge ${getStatusColor(
                  parcel.status
                )} gap-2 p-4 text-sm`}
              >
                {getStatusIcon(parcel.status)}
                {getStatusText(parcel.status)}
              </div>

            </div>


          </div>

        </div>


        {/* STATUS TRACKER */}

        <div className="card bg-base-100 shadow-xl mt-6">

          <div className="card-body">

            <h2 className="card-title mb-5">
              Shipment Tracking
            </h2>


            {parcel.status === "cancelled" ? (

              <div className="alert alert-error">

                <FaTimesCircle />

                <span>
                  This parcel has been cancelled.
                </span>

              </div>

            ) : (

              <ul className="steps steps-vertical md:steps-horizontal w-full">

                <li
                  className={`step ${
                    [
                      "pending",
                      "picked_up",
                      "in_transit",
                      "delivered",
                    ].includes(parcel.status)
                      ? "step-primary"
                      : ""
                  }`}
                >
                  Pending
                </li>


                <li
                  className={`step ${
                    [
                      "picked_up",
                      "in_transit",
                      "delivered",
                    ].includes(parcel.status)
                      ? "step-primary"
                      : ""
                  }`}
                >
                  Picked Up
                </li>


                <li
                  className={`step ${
                    [
                      "in_transit",
                      "delivered",
                    ].includes(parcel.status)
                      ? "step-primary"
                      : ""
                  }`}
                >
                  In Transit
                </li>


                <li
                  className={`step ${
                    parcel.status === "delivered"
                      ? "step-primary"
                      : ""
                  }`}
                >
                  Delivered
                </li>

              </ul>

            )}

          </div>

        </div>


        {/* PARCEL INFORMATION */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">


          {/* RECEIVER */}

          <div className="card bg-base-100 shadow-xl">

            <div className="card-body">

              <h2 className="card-title">
                <FaUser className="text-primary" />
                Receiver Information
              </h2>


              <div className="divider"></div>


              <div className="space-y-4">


                <div>

                  <p className="text-sm opacity-60">
                    Name
                  </p>

                  <p className="font-semibold">
                    {parcel.receiver_name}
                  </p>

                </div>


                <div>

                  <p className="text-sm opacity-60 flex items-center gap-2">
                    <FaPhone />
                    Phone
                  </p>

                  <p className="font-semibold">
                    {parcel.receiver_phone}
                  </p>

                </div>


                <div>

                  <p className="text-sm opacity-60 flex items-center gap-2">
                    <FaMapMarkerAlt />
                    Address
                  </p>

                  <p className="font-semibold">
                    {parcel.receiver_address}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* PARCEL INFO */}

          <div className="card bg-base-100 shadow-xl">

            <div className="card-body">

              <h2 className="card-title">
                <FaBox className="text-primary" />
                Parcel Information
              </h2>


              <div className="divider"></div>


              <div className="space-y-4">


                <div className="flex justify-between">

                  <span className="opacity-60">
                    Category
                  </span>

                  <span className="font-semibold">
                    {parcel.category}
                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="opacity-60 flex items-center gap-2">
                    <FaWeightHanging />
                    Weight
                  </span>

                  <span className="font-semibold">
                    {parcel.weight_kg} kg
                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="opacity-60 flex items-center gap-2">
                    <FaMoneyBillWave />
                    Price
                  </span>

                  <span className="font-semibold">
                    ৳{parcel.price}
                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="opacity-60">
                    Sender ID
                  </span>

                  <span className="font-semibold">
                    {parcel.sender_id}
                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="opacity-60">
                    Agent
                  </span>

                  <span className="font-semibold">

                    {parcel.agent_id
                      ? `Agent #${parcel.agent_id}`
                      : "Not assigned"}

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* STATUS DETAILS */}

        <div className="card bg-base-100 shadow-xl mt-6 mb-8">

          <div className="card-body">

            <h2 className="card-title">
              Current Status
            </h2>


            <div className="flex items-center gap-4 mt-3">

              <div
                className={`text-4xl ${
                  parcel.status === "delivered"
                    ? "text-success"
                    : parcel.status === "cancelled"
                    ? "text-error"
                    : "text-primary"
                }`}
              >
                {getStatusIcon(parcel.status)}
              </div>


              <div>

                <p className="text-xl font-bold">
                  {getStatusText(parcel.status)}
                </p>

                <p className="opacity-60">
                  Tracking ID:{" "}
                  {parcel.tracking_id}
                </p>

              </div>

            </div>

          </div>

        </div>


      </main>

    </div>
  );
}


export default ParcelDetails;