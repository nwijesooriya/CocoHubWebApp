import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaDownload, FaTrashAlt, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api, { apiError } from "../api";
import { PageHeader, Notice, Loading, formatDate, initials } from "./UI";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/user/");
      setUsers(res.data);
    } catch (err) {
      setError(apiError(err, "We could not load users. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function remove(user) {
    const ownAccount = user._id === localStorage.getItem("userId");
    if (ownAccount) {
      setError(
        "Use Account security in your profile to delete your own account.",
      );
      return;
    }
    const result = await Swal.fire({
      title: `Remove ${user.name}?`,
      text: "This permanently removes the user account and cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove user",
      confirmButtonColor: "#a83b32",
    });
    if (!result.isConfirmed) return;
    setBusyId(user._id);
    setError("");
    setMessage("");
    try {
      await api.delete(`/user/delete/${user._id}`, {
        data: { requesterId: localStorage.getItem("userId") },
      });
      setUsers((previous) => previous.filter((u) => u._id !== user._id));
      setMessage("The user has been removed.");
    } catch (err) {
      setError(apiError(err, "We could not remove this user."));
    } finally {
      setBusyId("");
    }
  }
  async function changeRole(user, role) {
    setBusyId(user._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/user/update/${user._id}`, {
        field: "expectedRole",
        value: role,
      });
      setUsers((previous) =>
        previous.map((u) =>
          u._id === user._id ? { ...u, expectedRole: role } : u,
        ),
      );
      setMessage(`${user.name}'s role has been updated.`);
    } catch (err) {
      setError(apiError(err, "We could not update this role."));
    } finally {
      setBusyId("");
    }
  }
  const filtered = users.filter((u) =>
    [u.name, u.email, u.mobile, u.expectedRole].some((value) =>
      value?.toLowerCase().includes(search.trim().toLowerCase()),
    ),
  );
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("CocoHub | User Management", 14, 22);
    autoTable(doc, {
      head: [["Name", "Email", "Mobile", "Role", "Date of birth", "Gender"]],
      body: filtered.map((u) => [
        u.name,
        u.email,
        u.mobile || "—",
        u.expectedRole,
        formatDate(u.dob),
        u.gender,
      ]),
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 76, 56] },
    });
    doc.save("User_Report.pdf");
  }
  return (
    <div className="manage-users-container">
      <PageHeader
        eyebrow="CocoHub administration"
        title="People make it possible."
        description="Manage your community's accounts and roles."
      >
        <Link to="/profile" className="btn btn-secondary">
          Back to your account
        </Link>
      </PageHeader>
      <Notice>{error}</Notice>
      <Notice type="success">{message}</Notice>
      <div className="top-bar">
        <div className="search-field">
          <FaSearch />
          <label htmlFor="user-search" className="visually-hidden">
            Search users by name, email, mobile, or role
          </label>
          <input
            type="search"
            id="user-search"
            placeholder="Search name, email, mobile or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={exportPDF}
          disabled={loading || !filtered.length}
        >
          <FaDownload /> Export PDF
        </button>
      </div>
      {loading ? (
        <Loading text="Loading community accounts…" />
      ) : error && !users.length ? (
        <button className="btn btn-secondary" onClick={fetchUsers}>
          Try again
        </button>
      ) : (
        <>
          <p className="section-caption" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "account" : "accounts"}
          </p>
          {filtered.length ? (
            <div className="table-scroll">
              <table className="users-table">
                <caption className="visually-hidden">
                  CocoHub user accounts
                </caption>
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Mobile",
                      "Role",
                      "Date of birth",
                      "Gender",
                      "Action",
                    ].map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="customer-line">
                          <span className="customer-avatar">
                            {initials(u.name)}
                          </span>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.mobile || "—"}</td>
                      <td>
                        <select
                          aria-label={`Role for ${u.name}`}
                          className="role-select"
                          value={u.expectedRole}
                          onChange={(e) => changeRole(u, e.target.value)}
                          disabled={busyId === u._id}
                        >
                          {[
                            "Admin",
                            "Manager",
                            "Customer",
                            "Supplier",
                            "Delivery_person",
                          ].map((role) => (
                            <option key={role} value={role}>
                              {role.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{formatDate(u.dob)}</td>
                      <td>{u.gender}</td>
                      <td>
                        <button
                          className="delete-user-button"
                          onClick={() => remove(u)}
                          disabled={busyId === u._id}
                        >
                          <FaTrashAlt /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="surface empty-state">
              <h2>No accounts found.</h2>
              <p>
                {search
                  ? "Try another name, email, mobile number, or role."
                  : "New registrations will appear here."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
