import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaUsers,
  FaTruck,
  FaSignOutAlt,
  FaSearch,
  FaEye,
  FaTrash,
  FaPlus,
  FaSync,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");

  const [showAgentForm, setShowAgentForm] = useState(false);

  const [agentForm, setAgentForm] = useState({
    name: "",
    phone: "",
  });


  // =====================================================
  // FETCH STATS
  // =====================================================

  const fetchStats = async () => {
    const response = await api.get(
      "/parcels/admin/stats"
    );

    setStats(response.data);
  };


  // =====================================================
  // FETCH AGENTS
  // =====================================================

  const fetchAgents = async () => {
    const response = await api.get(
      "/parcels/admin/agents"
    );

    setAgents(response.data);
  };


  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    const response = await api.get(
      "/parcels/admin/users"
    );

    setUsers(response.data);
  };


  // =====================================================
  // FETCH PARCELS
  // =====================================================

  const fetchParcels = async (
    searchValue = search,
    categoryValue = category,
    statusValue = statusFilter,
    sortValue = sort
  ) => {
    try {
      setLoading(true);

      const params = {
        sort: sortValue,
      };

      if (searchValue.trim()) {
        params.search = searchValue.trim();
      }

      if (categoryValue) {
        params.category = categoryValue;
      }

      if (statusValue) {
        params.status_filter = statusValue;
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
  // FETCH EVERYTHING
  // =====================================================

  const fetchAllData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchStats(),
        fetchAgents(),
        fetchUsers(),
        fetchParcels(),
      ]);

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAllData();
  }, []);


  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (e) => {
    e.preventDefault();

    fetchParcels(
      search,
      category,
      statusFilter,
      sort
    );
  };


  // =====================================================
  // STATUS CHANGE
  // =====================================================

  const handleStatusChange = async (
    parcelId,
    newStatus
  ) => {
    try {
      setActionLoading(true);

      const parcel = parcels.find(
        (item) => item.id === parcelId
      );

      if (!parcel) {
        return;
      }

      await api.patch(
        `/parcels/${parcelId}/status`,
        {
          status: newStatus,
          agent_id: parcel.agent_id || null,
        }
      );

      toast.success(
        "Parcel status updated!"
      );

      await fetchStats();
      await fetchAgents();
      await fetchParcels();

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to update status"
      );
    } finally {
      setActionLoading(false);
    }
  };


  // =====================================================
  // ASSIGN / UNASSIGN AGENT
  // =====================================================

  const handleAssignAgent = async (
    parcelId,
    agentId
  ) => {
    try {
      setActionLoading(true);

      const parcel = parcels.find(
        (item) => item.id === parcelId
      );

      if (!parcel) {
        return;
      }


      // -------------------------------
      // NO AGENT = UNASSIGN
      // -------------------------------

      if (!agentId) {

        await api.delete(
          `/parcels/${parcelId}/agent`
        );

        // Immediately update the UI
        setParcels((currentParcels) =>
          currentParcels.map((item) =>
            item.id === parcelId
              ? {
                  ...item,
                  agent_id: null,
                }
              : item
          )
        );

        toast.success(
          "Agent unassigned successfully!"
        );

      }


      // -------------------------------
      // ASSIGN AGENT
      // -------------------------------

      else {

        await api.patch(
          `/parcels/${parcelId}/status`,
          {
            status: parcel.status,
            agent_id: Number(agentId),
          }
        );

        // Immediately update the UI
        setParcels((currentParcels) =>
          currentParcels.map((item) =>
            item.id === parcelId
              ? {
                  ...item,
                  agent_id: Number(agentId),
                }
              : item
          )
        );

        toast.success(
          "Agent assigned successfully!"
        );
      }


      await fetchAgents();
      await fetchStats();
      await fetchParcels();

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to update agent"
      );
    } finally {
      setActionLoading(false);
    }
  };


  // =====================================================
  // DELETE PARCEL
  // =====================================================

  const handleDelete = async (
    parcelId
  ) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this parcel?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await api.delete(
        `/parcels/${parcelId}`
      );

      toast.success(
        "Parcel deleted successfully!"
      );

      await fetchStats();
      await fetchAgents();
      await fetchParcels();

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to delete parcel"
      );
    } finally {
      setActionLoading(false);
    }
  };


  // =====================================================
  // AGENT FORM
  // =====================================================

  const handleAgentChange = (e) => {
    setAgentForm({
      ...agentForm,
      [e.target.name]: e.target.value,
    });
  };


  // =====================================================
  // ADD AGENT
  // =====================================================

  const handleAddAgent = async (e) => {
    e.preventDefault();

    if (!agentForm.name.trim()) {
      toast.error("Enter agent name");
      return;
    }

    if (!agentForm.phone.trim()) {
      toast.error("Enter agent phone");
      return;
    }

    try {
      setActionLoading(true);

      await api.post(
        "/parcels/admin/agents",
        null,
        {
          params: {
            name: agentForm.name.trim(),
            phone: agentForm.phone.trim(),
          },
        }
      );

      toast.success(
        "Agent added successfully!"
      );

      setAgentForm({
        name: "",
        phone: "",
      });

      setShowAgentForm(false);

      await fetchAgents();
      await fetchStats();

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to add agent"
      );
    } finally {
      setActionLoading(false);
    }
  };


  // =====================================================
  // TOGGLE AGENT AVAILABILITY
  // =====================================================

  const handleToggleAgent = async (
    agentId
  ) => {
    try {
      setActionLoading(true);

      await api.patch(
        `/parcels/admin/agents/${agentId}/availability`
      );

      toast.success(
        "Agent availability updated!"
      );

      await fetchAgents();
      await fetchStats();

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to update availability"
      );
    } finally {
      setActionLoading(false);
    }
  };


  // =====================================================
  // DELETE AGENT
  // =====================================================

  const handleDeleteAgent = async (
    agentId
  ) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this agent?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await api.delete(
        `/parcels/admin/agents/${agentId}`
      );

      toast.success(
        "Agent deleted successfully!"
      );

      await fetchAgents();
      await fetchStats();

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to delete agent"
      );
    } finally {
      setActionLoading(false);
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
  // LOADING SCREEN
  // =====================================================

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">

        <span className="loading loading-spinner loading-lg text-primary"></span>

      </div>
    );
  }


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

          <span className="text-xl font-bold text-primary">
            Courier & Logistics — Admin
          </span>

        </div>


        <div className="flex items-center gap-4">

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
              Admin Dashboard
            </h1>

            <p className="opacity-70 mt-1">
              Monitor and manage the entire courier system.
            </p>

          </div>


          <button
            onClick={fetchAllData}
            className="btn btn-outline"
            disabled={loading}
          >
            <FaSync />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

        </div>


        {/* =================================================
            MAIN STATS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-figure text-primary">
              <FaBox size={28} />
            </div>

            <div className="stat-title">
              Total Parcels
            </div>

            <div className="stat-value text-primary">
              {stats?.total_parcels || 0}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-figure text-secondary">
              <FaUsers size={28} />
            </div>

            <div className="stat-title">
              Total Users
            </div>

            <div className="stat-value text-secondary">
              {stats?.total_users || 0}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-figure text-accent">
              <FaTruck size={28} />
            </div>

            <div className="stat-title">
              Available Agents
            </div>

            <div className="stat-value text-accent">
              {stats?.available_agents || 0}
            </div>

          </div>

        </div>


        {/* =================================================
            STATUS STATS
        ================================================= */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-title">
              Pending
            </div>

            <div className="stat-value text-warning">
              {stats?.pending || 0}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-title">
              Picked Up
            </div>

            <div className="stat-value">
              {stats?.picked_up || 0}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-title">
              In Transit
            </div>

            <div className="stat-value text-info">
              {stats?.in_transit || 0}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-title">
              Delivered
            </div>

            <div className="stat-value text-success">
              {stats?.delivered || 0}
            </div>

          </div>


          <div className="stat bg-base-100 shadow rounded-box">

            <div className="stat-title">
              Cancelled
            </div>

            <div className="stat-value text-error">
              {stats?.cancelled || 0}
            </div>

          </div>

        </div>


        {/* =================================================
            PARCEL MANAGEMENT
        ================================================= */}

        <div className="card bg-base-100 shadow-xl mt-8">

          <div className="card-body">

            <h2 className="card-title mb-3">
              Parcel Management
            </h2>


            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 md:grid-cols-6 gap-3"
            >


              <input
                type="text"
                className="input input-bordered md:col-span-2"
                placeholder="Search tracking ID, receiver, phone..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />


              <select
                className="select select-bordered"
                value={category}
                onChange={(e) => {
                  const value = e.target.value;

                  setCategory(value);

                  fetchParcels(
                    search,
                    value,
                    statusFilter,
                    sort
                  );
                }}
              >

                <option value="">
                  All Categories
                </option>

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


              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => {

                  const value = e.target.value;

                  setStatusFilter(value);

                  fetchParcels(
                    search,
                    category,
                    value,
                    sort
                  );

                }}
              >

                <option value="">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="picked_up">
                  Picked Up
                </option>

                <option value="in_transit">
                  In Transit
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </select>


              <select
                className="select select-bordered"
                value={sort}
                onChange={(e) => {

                  const value = e.target.value;

                  setSort(value);

                  fetchParcels(
                    search,
                    category,
                    statusFilter,
                    value
                  );

                }}
              >

                <option value="newest">
                  Newest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="price_high">
                  Price: High → Low
                </option>

                <option value="price_low">
                  Price: Low → High
                </option>

                <option value="weight_high">
                  Weight: High → Low
                </option>

                <option value="weight_low">
                  Weight: Low → High
                </option>

              </select>


              <button
                type="submit"
                className="btn btn-primary"
              >
                <FaSearch />
                Search
              </button>

            </form>

          </div>

        </div>


        {/* =================================================
            ALL PARCELS
        ================================================= */}

        <div className="card bg-base-100 shadow-xl mt-6">

          <div className="card-body">


            <div className="flex justify-between items-center mb-3">

              <h2 className="card-title">
                All Parcels
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

              <div className="text-center py-10 opacity-70">
                No parcels found.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="table">


                  <thead>

                    <tr>

                      <th>ID</th>
                      <th>Tracking</th>
                      <th>Sender</th>
                      <th>Receiver</th>
                      <th>Category</th>
                      <th>Weight</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Agent</th>
                      <th>Actions</th>

                    </tr>

                  </thead>


                  <tbody>

                    {parcels.map(
                      (parcel) => (

                        <tr key={parcel.id}>


                          <td>
                            {parcel.id}
                          </td>


                          <td>

                            <span className="font-mono font-bold">
                              {parcel.tracking_id}
                            </span>

                          </td>


                          <td>
                            {parcel.sender_id}
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

                            <select
                              className="select select-bordered select-sm"
                              value={parcel.status}
                              disabled={actionLoading}
                              onChange={(e) =>
                                handleStatusChange(
                                  parcel.id,
                                  e.target.value
                                )
                              }
                            >

                              <option value="pending">
                                Pending
                              </option>

                              <option value="picked_up">
                                Picked Up
                              </option>

                              <option value="in_transit">
                                In Transit
                              </option>

                              <option value="delivered">
                                Delivered
                              </option>

                              <option value="cancelled">
                                Cancelled
                              </option>

                            </select>

                          </td>


                          <td>

                            <select
                              className="select select-bordered select-sm w-40"
                              value={
                                parcel.agent_id || ""
                              }
                              disabled={actionLoading}
                              onChange={(e) =>
                                handleAssignAgent(
                                  parcel.id,
                                  e.target.value
                                )
                              }
                            >

                              <option value="">
                                No Agent
                              </option>


                              {agents.map(
                                (agent) => (

                                  <option
                                    key={agent.id}
                                    value={agent.id}
                                    disabled={
                                      !agent.is_available &&
                                      agent.id !==
                                        parcel.agent_id
                                    }
                                  >

                                    {agent.name}

                                    {!agent.is_available &&
                                    agent.id !==
                                      parcel.agent_id
                                      ? " (Busy)"
                                      : ""}

                                  </option>

                                )
                              )}

                            </select>

                          </td>


                          <td>

                            <div className="flex gap-2">


                              <Link
                                to={`/parcels/${parcel.id}`}
                                className="btn btn-info btn-sm"
                                title="View"
                              >

                                <FaEye />

                              </Link>


                              <button
                                onClick={() =>
                                  handleDelete(
                                    parcel.id
                                  )
                                }
                                className="btn btn-error btn-sm"
                                disabled={
                                  actionLoading
                                }
                                title="Delete"
                              >

                                <FaTrash />

                              </button>


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


        {/* =================================================
            AGENT MANAGEMENT
        ================================================= */}

        <div className="card bg-base-100 shadow-xl mt-8">

          <div className="card-body">


            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">


              <div>

                <h2 className="card-title">
                  Agent Management
                </h2>

                <p className="opacity-70">
                  Manage delivery agents and availability.
                </p>

              </div>


              <button
                className="btn btn-primary"
                onClick={() =>
                  setShowAgentForm(
                    !showAgentForm
                  )
                }
              >

                <FaPlus />
                Add Agent

              </button>

            </div>


            {/* ADD AGENT FORM */}

            {showAgentForm && (

              <form
                onSubmit={handleAddAgent}
                className="bg-base-200 rounded-lg p-5 mt-5"
              >

                <h3 className="font-bold text-lg mb-4">
                  Add New Agent
                </h3>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">


                  <input
                    name="name"
                    className="input input-bordered"
                    placeholder="Agent name"
                    value={agentForm.name}
                    onChange={handleAgentChange}
                    required
                  />


                  <input
                    name="phone"
                    className="input input-bordered"
                    placeholder="Phone number"
                    value={agentForm.phone}
                    onChange={handleAgentChange}
                    required
                  />


                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >

                    {actionLoading
                      ? "Adding..."
                      : "Add Agent"}

                  </button>

                </div>

              </form>

            )}


            {/* AGENTS TABLE */}

            <div className="overflow-x-auto mt-5">


              {agents.length === 0 ? (

                <div className="text-center py-8 opacity-70">
                  No agents available.
                </div>

              ) : (

                <table className="table">


                  <thead>

                    <tr>

                      <th>ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Availability</th>
                      <th>Action</th>

                    </tr>

                  </thead>


                  <tbody>


                    {agents.map(
                      (agent) => (

                        <tr key={agent.id}>


                          <td>
                            {agent.id}
                          </td>


                          <td>
                            {agent.name}
                          </td>


                          <td>
                            {agent.phone}
                          </td>


                          <td>

                            <span
                              className={`badge ${
                                agent.is_available
                                  ? "badge-success"
                                  : "badge-error"
                              }`}
                            >

                              {agent.is_available
                                ? "Available"
                                : "Unavailable"}

                            </span>

                          </td>


                          <td>

                            <div className="flex gap-2">


                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() =>
                                  handleToggleAgent(
                                    agent.id
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >

                                {agent.is_available ? (
                                  <>
                                    <FaToggleOn />
                                    Set Unavailable
                                  </>
                                ) : (
                                  <>
                                    <FaToggleOff />
                                    Set Available
                                  </>
                                )}

                              </button>


                              <button
                                className="btn btn-error btn-sm"
                                onClick={() =>
                                  handleDeleteAgent(
                                    agent.id
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >

                                <FaTrash />
                                Delete

                              </button>


                            </div>

                          </td>


                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            USER MANAGEMENT
        ================================================= */}

        <div className="card bg-base-100 shadow-xl mt-8 mb-8">

          <div className="card-body">


            <div className="flex justify-between items-center">


              <div>

                <h2 className="card-title">
                  User Management
                </h2>

                <p className="opacity-70">
                  View registered users.
                </p>

              </div>


              <div className="badge badge-secondary">
                {users.length} users
              </div>

            </div>


            <div className="overflow-x-auto mt-5">


              {users.length === 0 ? (

                <div className="text-center py-8 opacity-70">
                  No users found.
                </div>

              ) : (

                <table className="table">


                  <thead>

                    <tr>

                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joined</th>

                    </tr>

                  </thead>


                  <tbody>


                    {users.map(
                      (item) => (

                        <tr key={item.id}>


                          <td>
                            {item.id}
                          </td>


                          <td className="font-semibold">
                            {item.name}
                          </td>


                          <td>
                            {item.email}
                          </td>


                          <td>
                            {item.phone || "—"}
                          </td>


                          <td>

                            <span
                              className={`badge ${
                                item.role === "admin"
                                  ? "badge-secondary"
                                  : "badge-primary"
                              }`}
                            >

                              {item.role}

                            </span>

                          </td>


                          <td>

                            {item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleDateString()
                              : "—"}

                          </td>


                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        </div>


      </main>

    </div>
  );
}


export default AdminDashboard;