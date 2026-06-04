import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ROLE_COLORS = {
    Admin:           { bg: '#fef3c7', color: '#92400e' },
    Manager:         { bg: '#dbeafe', color: '#1e40af' },
    Customer:        { bg: '#d1fae5', color: '#065f46' },
    Supplier:        { bg: '#ede9fe', color: '#5b21b6' },
    Delivery_person: { bg: '#fee2e2', color: '#991b1b' },
};

function ManageUsers() {
    const [users, setUsers]           = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:8000/user/");
            setUsers(res.data);
        } catch (err) { console.error("Error fetching users:", err); }
    };

    const handleDelete = (userId) => {
        Swal.fire({
            title: "Delete this user?",
            text: "This action is permanent and cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8000/user/delete/${userId}`, {
                        data: { requesterId: localStorage.getItem("userId") }
                    });
                    Swal.fire({ icon: "success", title: "Deleted!", text: "User removed successfully.", timer: 1500, showConfirmButton: false });
                    fetchUsers();
                } catch (error) {
                    Swal.fire({ icon: "error", title: "Failed", text: error.response?.data?.message || "Could not delete user." });
                }
            }
        });
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:8000/user/update/${userId}`, { field: "expectedRole", value: newRole });
            Swal.fire({ icon: "success", title: "Role Updated", text: `Role changed to ${newRole}`, timer: 1400, showConfirmButton: false });
            fetchUsers();
        } catch (err) {
            Swal.fire({ icon: "error", title: "Update Failed", text: err.response?.data?.message || "Could not update role." });
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('User Management Report', 14, 22);
        const cols = ["Name", "Email", "Mobile", "Role", "DOB", "Gender"];
        const rows = users.map(u => [u.name || "-", u.email || "-", u.mobile || "-", u.expectedRole || "-", u.dob ? u.dob.split("T")[0] : "-", u.gender || "-"]);
        autoTable(doc, { head: [cols], body: rows, startY: 30, styles: { fontSize: 10 } });
        doc.save('User_Report.pdf');
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.mobile?.includes(searchTerm) ||
        u.expectedRole?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const style = ROLE_COLORS[role] || { bg: '#f3f4f6', color: '#374151' };
        return (
            <span style={{
                background: style.bg, color: style.color,
                padding: '3px 10px', borderRadius: 999,
                fontSize: '0.78rem', fontWeight: 700
            }}>{role || '-'}</span>
        );
    };

    return (
        <div className="manage-users-container">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', color: '#047857', fontSize: '1.8rem', fontWeight: 800 }}>
                    👥 Manage Users
                </h1>
                <span style={{ background: 'rgba(5,150,105,0.1)', color: '#047857', borderRadius: 999, padding: '4px 14px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {filtered.length} user{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Top bar */}
            <div className="top-bar">
                <input
                    type="text"
                    id="user-search"
                    placeholder="Search by name, email, mobile or role…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar2"
                />
                <button className="export-button" id="export-pdf-btn" onClick={handleExportPDF}>
                    📄 Export PDF
                </button>
            </div>

            {/* Table */}
            {filtered.length > 0 ? (
                <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Role</th>
                                <th>Date of Birth</th>
                                <th>Gender</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user, index) => (
                                <tr key={user._id}>
                                    <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{index + 1}</td>
                                    <td style={{ fontWeight: 700, color: '#1a1a2e' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: '50%',
                                                background: 'linear-gradient(135deg,#047857,#10b981)',
                                                color: '#fff', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700
                                            }}>
                                                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?'}
                                            </div>
                                            {user.name || '-'}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email || '-'}</td>
                                    <td>{user.mobile || '-'}</td>
                                    <td>
                                        <select
                                            value={user.expectedRole || "Customer"}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="role-select"
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Customer">Customer</option>
                                            <option value="Supplier">Supplier</option>
                                            <option value="Delivery_person">Delivery</option>
                                        </select>
                                    </td>
                                    <td style={{ fontSize: '0.875rem' }}>
                                        {user.dob
                                            ? new Date(user.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        {user.gender
                                            ? <span style={{
                                                background: user.gender === 'Male' ? '#dbeafe' : user.gender === 'Female' ? '#fce7f3' : '#f3f4f6',
                                                color: user.gender === 'Male' ? '#1d4ed8' : user.gender === 'Female' ? '#be185d' : '#374151',
                                                padding: '2px 10px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600
                                              }}>{user.gender}</span>
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <button
                                            className="delete-user-button"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            🗑 Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '1rem' }}>
                    {users.length === 0 ? 'No users found.' : '🔍 No results match your search.'}
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
