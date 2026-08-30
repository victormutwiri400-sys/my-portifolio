import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { getRequestError } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/CV.css";

const CV = ({ isAdmin }) => {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    section_type: "education",
    title: "",
    organization: "",
    duration: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get("/cv-entries");
      if (response.data.status === "success") {
        setEntries(response.data.data || []);
      }
    } catch (_err) {
      // Keep the existing entries visible when a refresh fails.
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsWorking(true);
    try {
      if (editingId) {
        await api.put(
          `/cv-entries/${editingId}`,
          formData,
        );
        toast.success("CV entry updated successfully!");
        setEditingId(null);
      } else {
        await api.post("/cv-entries", formData);
        toast.success("CV entry added successfully!");
      }
      setFormData({
        section_type: "education",
        title: "",
        organization: "",
        duration: "",
        description: "",
      });
      setIsAdding(false);
      await fetchEntries();
    } catch (err) {
      toast.error(getRequestError(err, editingId ? "Failed to update CV entry" : "Failed to add CV entry"));
    } finally {
      setIsWorking(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData(entry);
    setEditingId(entry.id);
    setIsAdding(true);
  };

  const deleteEntry = async () => {
    setIsWorking(true);
    try {
      await api.delete(`/cv-entries/${confirmId}`);
      toast.success("CV entry deleted successfully!");
      await fetchEntries();
    } catch (err) {
      toast.error(getRequestError(err, "Failed to delete CV entry"));
    } finally {
      setIsWorking(false);
      setConfirmId(null);
    }
  };

  const filteredEntries =
    filter === "all"
      ? entries
      : entries.filter((entry) => entry.section_type === filter);

  const sections = {
    education: "Education",
    experience: "Experience",
    skill: "Skills",
  };

  return (
    <section className="cv-section">
      <div className="cv-container">
        <h2>CV & Experience</h2>

        <div className="cv-filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "education" ? "active" : ""}
            onClick={() => setFilter("education")}
          >
            Education
          </button>
          <button
            className={filter === "experience" ? "active" : ""}
            onClick={() => setFilter("experience")}
          >
            Experience
          </button>
          <button
            className={filter === "skill" ? "active" : ""}
            onClick={() => setFilter("skill")}
          >
            Skills
          </button>
        </div>

        {isAdmin && <button onClick={() => setIsAdding(true)} className="add-btn" disabled={isWorking}>
          + Add Entry
        </button>}

        {isWorking && !isAdding && <LoadingSpinner label="Updating CV..." />}

        {isAdding && (
          <Modal title={editingId ? "Edit CV entry" : "Add CV entry"} onClose={() => setIsAdding(false)}>
          <form onSubmit={handleSubmit} className="cv-form">
            <div className="form-group">
              <label>Type</label>
              <select
                name="section_type"
                value={formData.section_type}
                onChange={handleInputChange}
              >
                <option value="education">Education</option>
                <option value="experience">Experience</option>
                <option value="skill">Skill</option>
              </select>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Bachelor of Science in Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label>Organization/Institution</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="e.g., University Name, Company Name"
              />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 2020 - 2024"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Details about this entry"
                rows="4"
              />
            </div>

            {isWorking && <LoadingSpinner label="Saving entry..." />}

            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={isWorking}>
                {editingId ? "Update Entry" : "Add Entry"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({
                    section_type: "education",
                    title: "",
                    organization: "",
                    duration: "",
                    description: "",
                  });
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
          </Modal>
        )}

        {loading ? <LoadingSpinner label="Loading CV entries..." /> : <div className="cv-entries">
          {filteredEntries.length === 0 ? (
            <div className="empty-state"><span>✦</span><p>No CV entries added yet.</p></div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="cv-entry">
                <div className="entry-header">
                  <span className="entry-type">
                    {sections[entry.section_type]}
                  </span>
                  {isAdmin && <div className="entry-actions">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="edit-btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmId(entry.id)}
                      className="delete-btn-small"
                    >
                      Delete
                    </button>
                  </div>}
                </div>
                <h3>{entry.title}</h3>
                {entry.organization && (
                  <p className="organization">{entry.organization}</p>
                )}
                {entry.duration && <p className="duration">{entry.duration}</p>}
                {entry.description && (
                  <p className="description">{entry.description}</p>
                )}
              </div>
            ))
          )}
        </div>}

        {confirmId !== null && (
          <ConfirmDialog
            title="Delete CV entry"
            message="This entry will be permanently removed from your CV. Continue?"
            confirmLabel="Delete entry"
            busy={isWorking}
            onCancel={() => setConfirmId(null)}
            onConfirm={deleteEntry}
          />
        )}
      </div>
    </section>
  );
};

export default CV;
