import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaSearch,
  FaEye,
  FaEdit,
  FaTimes,
  FaTruck,
  FaSignOutAlt,
  FaPlus,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);


  // =====================================================
  // FETCH MY PARCELS
  // =====================================================

  const fetchParcels = async (searchValue = "") => {
    try {
      setLoading(true);

      const params = {};

      if (searchValue.trim()) {
        params.search = searchValue.trim();
      }

      const response = await api.get(
        "/parcels",
        { params }
      );

      setParcels(response.data);

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load parcels"
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchParcels();
  }, []);


  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      setSearching(true);

      await fetchParcels(search);

    } finally {
      setSearching(false);
    }
  };


  // =====================================================
  // CANCEL PARCEL
  // =====================================================

  const handleCancel = async (parcelId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this parcel?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
  `/parcels/${parcelId}`
);

      toast.success(
        "Parcel cancelled successfully!"
      );

      await fetchParcels(search);

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to cancel parcel"
      );
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge = (status) => {
    const styles = {
      pending: "badge-warning",
      picked_up: "badge-info",
      in_transit: "badge-info",
      delivered: "badge-success",
      cancelled: "badge-error",
    };

    const names = {
      pending: "pending",
      picked_up: "picked up",
      in_transit: "in transit",
      delivered: "delivered",
      cancelled: "cancelled",
    };

    return (
      <span
        className={`badge ${
          styles[status] || "badge-neutral"
        }`}
      >
        {names[status] || status}
      </span>
    );
  };


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalParcels = parcels.length;

  const inTransit = parcels.filter(
    (parcel) =>
      parcel.status === "in_transit" ||
      parcel.status === "picked_up"
  ).length;

  const delivered = parcels.filter(
    (parcel) =>
      parcel.status === "delivered"
  ).length;


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-base-200">


      {/* =================================================
          NAVBAR
      ================================================= */}

      <div className="navbar bg-base-100 shadow-md px-6">

        <div className="flex-1">

          <Link
            to="/dashboard"
            className="text-xl font-bold text-primary"
          >
            Courier & Logistics
          </Link>

        </div>


        <div className="flex items-center gap-3">

          <span className="hidden sm:block">
            Hi, <b>{user?.name}</b>
          </span>


          <button
            onClick={handleLogout}
            className="btn btn-error btn-sm"
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

      </div>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto p-6">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">


          <div>

            <h1 className="text-3xl font-bold">
              User Dashboard
            </h1>

            <p className="opacity-70 mt-1">
              Manage and track your parcels.
            </p>

          </div>


          <div className="flex flex-wrap gap-3">


            <Link
              to="/tracking"
              className="btn btn-outline"
            >
              <FaTruck />
              Track Parcel
            </Link>


            <Link
              to="/book-parcel"
              className="btn btn-primary"
            >
              <FaPlus />
              Book Parcel
            </Link>

          </div>

        </div>


        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="card bg-base-100 shadow-xl mb-6">

          <div className="card-body">

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >

              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="Search tracking ID, receiver, phone..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />


              <button
                type="submit"
                className="btn btn-primary sm:w-32"
                disabled={searching}
              >

                {searching ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <FaSearch />
                    Search
                  </>
                )}

              </button>

            </form>

          </div>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-figure text-primary">
              <FaBox size={28} />
            </div>

            <div className="stat-title">
              Total Parcels
            </div>

            <div className="stat-value text-primary">
              {totalParcels}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-title">
              In Transit
            </div>

            <div className="stat-value text-info">
              {inTransit}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-title">
              Delivered
            </div>

            <div className="stat-value text-success">
              {delivered}
            </div>

          </div>

        </div>


        {/* =================================================
            PARCEL TABLE
        ================================================= */}

        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">


            <div className="flex justify-between items-center mb-3">

              <h2 className="card-title">
                My Parcels
              </h2>

              <span className="badge badge-primary">
                {parcels.length} shown
              </span>

            </div>


            {loading ? (

              <div className="flex justify-center py-10">

                <span className="loading loading-spinner loading-lg text-primary"></span>

              </div>

            ) : parcels.length === 0 ? (

              <div className="text-center py-10">

                <FaBox
                  size={40}
                  className="mx-auto mb-3 opacity-40"
                />

                <p className="opacity-70">
                  No parcels found.
                </p>


                <Link
                  to="/book-parcel"
                  className="btn btn-primary mt-4"
                >
                  <FaPlus />
                  Book Your First Parcel
                </Link>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="table">


                  <thead>

                    <tr>

                      <th>Tracking ID</th>
                      <th>Receiver</th>
                      <th>Category</th>
                      <th>Weight</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>

                    </tr>

                  </thead>


                  <tbody>

                    {parcels.map(
                      (parcel) => (

                        <tr key={parcel.id}>


                          <td>

                            <span className="font-mono font-bold">
                              {parcel.tracking_id}
                            </span>

                          </td>


                          <td>
                            {parcel.receiver_name}
                          </td>


                          <td>
                            {parcel.category}
                          </td>


                          <td>
                            {parcel.weight_kg} kg
                          </td>


                          <td>
                            ৳{parcel.price}
                          </td>


                          <td>
                            {getStatusBadge(
                              parcel.status
                            )}
                          </td>


                          <td>

                            <div className="flex gap-2">


                              {/* VIEW */}

                              <Link
                                to={`/parcels/${parcel.id}`}
                                className="btn btn-info btn-sm"
                                title="View parcel"
                              >
                                <FaEye />
                              </Link>


                              {/* EDIT */}

                              {parcel.status ===
                                "pending" && (

                                <Link
                                  to={`/parcels/${parcel.id}/edit`}
                                  className="btn btn-warning btn-sm"
                                  title="Edit parcel"
                                >
                                  <FaEdit />
                                </Link>

                              )}


                              {/* CANCEL */}

                              {parcel.status ===
                                "pending" && (

                                <button
                                  onClick={() =>
                                    handleCancel(
                                      parcel.id
                                    )
                                  }
                                  className="btn btn-error btn-sm"
                                  title="Cancel parcel"
                                >
                                  <FaTimes />
                                </button>

                              )}

                            </div>

                          </td>


                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>


      </main>

    </div>
  );
}


export default UserDashboard;