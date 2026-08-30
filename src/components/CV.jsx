import React, { useState, useEffect } from "react";
import api from "../api";
import LoadingSpinner from "./LoadingSpinner";
import "../styles/CV.css";

const CV = () => {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
        setEditingId(null);
      } else {
        await api.post("/cv-entries", formData);
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
    } catch (_err) {
      // A spinner is shown while the request is pending instead of an error banner.
    } finally {
      setIsWorking(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData(entry);
    setEditingId(entry.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        setIsWorking(true);
        await api.delete(`/cv-entries/${id}`);
        await fetchEntries();
      } catch (_err) {
        // Keep the current list when deletion cannot be completed.
      } finally {
        setIsWorking(false);
      }
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

        <button onClick={() => setIsAdding(true)} className="add-btn" disabled={isWorking}>
          + Add Entry
        </button>

        {isWorking && !isAdding && <LoadingSpinner label="Updating CV..." />}

        {isAdding && (
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
        )}

        {loading ? <LoadingSpinner label="Loading CV entries..." /> : <div className="cv-entries">
          {filteredEntries.length === 0 ? (
            <p className="no-entries">No entries yet. Add your first one!</p>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="cv-entry">
                <div className="entry-header">
                  <span className="entry-type">
                    {sections[entry.section_type]}
                  </span>
                  <div className="entry-actions">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="edit-btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="delete-btn-small"
                    >
                      Delete
                    </button>
                  </div>
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
      </div>
    </section>
  );
};

export default CV;
