import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { assetUrl, getRequestError } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import AssetPreview from "./AssetPreview";
import Modal from "./Modal";
import "../styles/Profile.css";

const Profile = ({ isAdmin }) => {
  const [profile, setProfile] = useState({
    name: "",
    title: "",
    bio: "",
    profile_image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      if (response.data.status === "success" && response.data.data) {
        setProfile(response.data.data);
      }
    } catch (_err) {
      // Keep the portfolio view usable if the profile has not been created yet.
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("title", profile.title);
      formData.append("bio", profile.bio);

      if (selectedFile) {
        formData.append("profile_image", selectedFile);
      }

      const response = await api.post(
        "/profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.status === "success") {
        toast.success("Profile saved successfully!");
        setSelectedFile(null);
        setIsEditing(false);
        await fetchProfile();
      }
    } catch (err) {
      toast.error(getRequestError(err, "Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="loading"><LoadingSpinner label="Loading profile..." /></div>;

  return (
    <section className="profile-section">
      <div className="profile-container">
        {!isEditing ? (
          <div className="profile-view">
            {profile.profile_image && (
              <AssetPreview
                src={assetUrl(profile.profile_image)}
                alt="Profile"
                className="profile-image"
                pdfLabel="Open profile PDF"
              />
            )}
            <h1>{profile.name || "Your Name"}</h1>
            <h2 className="profile-title">{profile.title || "Your Title"}</h2>
            <p className="profile-bio">
              {profile.bio || "Add a bio about yourself"}
            </p>
            {isSaving && <LoadingSpinner label="Saving profile..." />}
            {isAdmin && <button onClick={() => setIsEditing(true)} className="edit-btn" disabled={isSaving}>
              Edit Profile
            </button>}
          </div>
        ) : (
          <Modal title="Edit profile" onClose={() => { setIsEditing(false); setSelectedFile(null); }}>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                required
              />
            </div>

            <div className="form-group">
              <label>Professional Title</label>
              <input
                type="text"
                name="title"
                value={profile.title}
                onChange={handleInputChange}
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows="5"
              />
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
              {profile.profile_image && (
                <p className="existing-image">
                  Current image: {profile.profile_image}
                </p>
              )}
            </div>

            {isSaving && <LoadingSpinner label="Saving profile..." />}

            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={isSaving}>
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
          </Modal>
        )}
      </div>
    </section>
  );
};

export default Profile;
