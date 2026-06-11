// UserProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import '../App.css';
import {
    FaEdit,
    FaSave,
    FaTimes,
    FaUserCircle,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaUser,
    FaLock,
    FaHistory,
    FaTrash,
    FaSignOutAlt,
    FaCog,
    FaCalendarAlt,
    FaEnvelope,
    FaPhone,
    FaUsers,
    FaCamera
  } from "react-icons/fa";

function UserProfile() {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: "",
    expectedRole: "",
    profileImage: "",
    mobile: "",
    createdAt: "",
    lastLogin: "",
  });
  
  const [activeTab, setActiveTab] = useState("personal");
  const [editField, setEditField] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const refreshed = await axios.get(`http://localhost:8000/user/get/${userId}`);
        const updatedData = refreshed.data;
        if (updatedData.profileImage && !updatedData.profileImage.startsWith('http')) {
          updatedData.profileImage = `http://localhost:8000${updatedData.profileImage}`;
        }
        setUserData(updatedData);
        setImagePreviewUrl(updatedData.profileImage);

      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch user data.");
      }
    };

    if (userId) fetchUserData();
    else setError("User ID not found. Please log in.");
  }, [userId]);

  const handleEdit = (field) => {
    setEditField(field);
    setError("");
  };

  const handleSave = async (field) => {
    try {
      const response = await axios.put(`http://localhost:8000/user/update/${userId}`, {
        field,
        value: userData[field],
      });

      if (response.status === 200) {
        setEditField("");
        setError("");
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  const handleCancelEdit = () => {
    setEditField("");
    setError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setShowImageModal(true);
    }
  };  

  const handleSaveImage = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("profileImage", selectedImage);
    formData.append("userId", userId);

    try {
      const response = await axios.post("http://localhost:8000/user/upload-image", formData);

      if (response.data.imageUrl) {
        const fullImageUrl = response.data.imageUrl.startsWith('http')
          ? response.data.imageUrl
          : `http://localhost:8000${response.data.imageUrl}`;
        setUserData((prev) => ({ ...prev, profileImage: fullImageUrl }));
        setImagePreviewUrl(fullImageUrl);
        setSelectedImage(null);
        setShowImageModal(false);
        setError("");
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile image updated.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload image.");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to sign out?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/login");
      }
    });
  };
  
  const handleDelete = async () => {
    if (!currentPassword) {
      setError("Password is required to delete account.");
      return;
    }

    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: "This action is permanent and cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete my account'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/user/delete/${userId}`, {
          data: { currentPassword, requesterId: userId },
        });
  
        Swal.fire({
          icon: 'success',
          title: 'Account Deleted',
          text: 'We are sorry to see you go.',
          timer: 2000,
          showConfirmButton: false
        });
  
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 2100);
  
      } catch (err) {
        setError(err.response?.data?.message || "Account deletion failed.");
      }
    }
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-grid">
        
        {/* SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <img
              src={imagePreviewUrl || "default-profile.png"}
              alt="Profile"
              className="profile-avatar-main"
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + userData.name + "&background=059669&color=fff"; }}
            />
            <label htmlFor="avatar-upload" className="avatar-edit-badge">
              <FaCamera />
            </label>
            <input 
              type="file" 
              id="avatar-upload" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div className="profile-info-basic">
            <h3>{userData.name || "User Name"}</h3>
            <span className="role-badge">{userData.expectedRole || "Member"}</span>
          </div>

          <nav className="profile-nav">
            <div 
              className={`profile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <FaUser /> Personal Info
            </div>
            <div 
              className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FaLock /> Security
            </div>
            {(userRole === "Admin" || userRole === "Manager") && (
              <div className="profile-nav-item" onClick={() => navigate("/manage-users")}>
                <FaUsers /> Manage Users
              </div>
            )}
            
            {/* Social Icons Integrated into Sidebar */}
            <div className="sidebar-social-wrapper">
              <p className="social-label">Connect with us</p>
              <div className="social-icons-row">
                <div className="social-dot facebook"><FaFacebookF /></div>
                <div className="social-dot twitter"><FaTwitter /></div>
                <div className="social-dot instagram"><FaInstagram /></div>
              </div>
            </div>
          </nav>

          <div className="profile-sidebar-footer">
            <button className="btn-logout-alt" onClick={handleLogout}>
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="profile-main-content">
          
          {/* Stats Summary Row */}
          <div className="stats-row">
            <div className="stat-card stat-gradient-card">
              <div className="stat-icon"><FaCalendarAlt /></div>
              <div className="stat-info">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{new Date(userData.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>
            <div className="stat-card stat-gradient-card">
              <div className="stat-icon"><FaHistory /></div>
              <div className="stat-info">
                <span className="stat-label">Last Login</span>
                <span className="stat-value">{userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : "Today"}</span>
              </div>
            </div>
            <div className="stat-card stat-gradient-card">
              <div className="stat-icon"><FaCog /></div>
              <div className="stat-info">
                <span className="stat-label">Status</span>
                <span className="stat-value" style={{color: 'var(--primary)'}}>Active</span>
              </div>
            </div>
          </div>

          {activeTab === 'personal' ? (
            <div className="profile-section-card darker-section-card">
              <div className="section-header">
                <h2><FaUser /> Personal Information</h2>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Manage your public profile and identity</p>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="info-grid">
                {/* Full Name */}
                <div className="info-item">
                  <span className="label">Full Name</span>
                  <div className="value-wrapper">
                    {editField === "name" ? (
                      <input
                        value={userData.name}
                        autoFocus
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        onBlur={() => handleSave("name")}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave("name")}
                      />
                    ) : (
                      <span className="value">{userData.name}</span>
                    )}
                    <button className="edit-action-btn" onClick={() => handleEdit("name")}>
                      <FaEdit />
                    </button>
                  </div>
                </div>

                {/* Email Address */}
                <div className="info-item">
                  <span className="label">Email Address</span>
                  <div className="value-wrapper">
                    {editField === "email" ? (
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        onBlur={() => handleSave("email")}
                      />
                    ) : (
                      <span className="value">{userData.email}</span>
                    )}
                    <button className="edit-action-btn" onClick={() => handleEdit("email")}>
                      <FaEdit />
                    </button>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="info-item">
                  <span className="label">Phone Number</span>
                  <div className="value-wrapper">
                    {editField === "mobile" ? (
                      <input
                        value={userData.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0,10);
                          setUserData({ ...userData, mobile: val });
                        }}
                        onBlur={() => handleSave("mobile")}
                      />
                    ) : (
                      <span className="value">{userData.mobile || "Not Provided"}</span>
                    )}
                    <button className="edit-action-btn" onClick={() => handleEdit("mobile")}>
                      <FaEdit />
                    </button>
                  </div>
                </div>

                {/* Gender */}
                <div className="info-item">
                  <span className="label">Gender</span>
                  <div className="value-wrapper">
                    <span className="value">{userData.gender || "-"}</span>
                    <FaCog style={{color: '#cbd5e1'}} />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="info-item">
                  <span className="label">Birthday</span>
                  <div className="value-wrapper">
                    <span className="value">{formatDate(userData.dob)}</span>
                    <FaCalendarAlt style={{color: '#cbd5e1'}} />
                  </div>
                </div>

                {/* Role */}
                <div className="info-item">
                  <span className="label">Current Role</span>
                  <div className="value-wrapper">
                    <span className="value" style={{textTransform: 'capitalize'}}>{userData.expectedRole?.replace('_', ' ')}</span>
                    <FaUsers style={{color: '#cbd5e1'}} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-section-card danger-zone darker-section-card">
              <div className="section-header">
                <h2><FaLock /> Account Security</h2>
              </div>
              
              <div className="danger-card-content">
                <div className="danger-icon-box"><FaTrash /></div>
                <div className="danger-text-box">
                  <h4>Delete Your Account</h4>
                  <p>Once you delete your account, there is no going back. All your data will be permanently removed from our servers. Please be certain.</p>
                  
                  <div className="delete-account-form">
                    <input 
                      type="password" 
                      placeholder="Confirm your password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button className="delete-button" onClick={handleDelete} style={{padding: '0 20px', height: '45px'}}>
                      Delete Account
                    </button>
                  </div>
                  {error && <p className="error" style={{textAlign: 'left', marginTop: '10px'}}>{error}</p>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Image Upload Modal Overlay */}
      {showImageModal && (
        <div className="upload-overlay">
          <div className="upload-modal">
            <h3 style={{marginBottom: '1rem'}}>Update Profile Photo</h3>
            <div className="upload-preview-circle">
              <img src={imagePreviewUrl} alt="Preview" />
            </div>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
              <button className="save-changes-button" onClick={handleSaveImage}>
                <FaSave /> Confirm Upload
              </button>
              <button className="cancel-changes-button" onClick={() => { setShowImageModal(false); setImagePreviewUrl(userData.profileImage); }} style={{color: 'var(--text-secondary)'}}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;