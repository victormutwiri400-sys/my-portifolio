import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api, { assetUrl, getRequestError, publicApi } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/Projects.css";

export const PROJECT_CATEGORIES = [
  "Full-Stack Development",
  "Web Applications",
];

const emptyForm = () => ({
  title: "",
  description: "",
  category: PROJECT_CATEGORIES[0],
  technologies: "",
  project_url: "",
  github_url: "",
  is_featured: false,
});

const validWebUrl = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch (_error) {
    return false;
  }
};

const Projects = ({ isAdmin = false }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await (isAdmin ? api : publicApi).get("/projects");
      if (response.data.status === "success") {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      toast.error(getRequestError(error, "Failed to load projects"));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const visibleProjects = useMemo(() => {
    const matching = activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);
    return [...matching].sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
  }, [activeCategory, projects]);

  const closeForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setSelectedFile(null);
    setFormData(emptyForm());
  };

  const startEditing = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      category: project.category || PROJECT_CATEGORIES[0],
      technologies: Array.isArray(project.technologies) ? project.technologies.join(", ") : "",
      project_url: project.project_url || "",
      github_url: project.github_url || "",
      is_featured: Boolean(project.is_featured),
    });
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validWebUrl(formData.project_url)) {
      toast.error("Enter a valid project URL beginning with http:// or https://.");
      return;
    }
    if (formData.github_url && !validWebUrl(formData.github_url)) {
      toast.error("Enter a valid GitHub URL beginning with http:// or https://, or leave it blank.");
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("description", formData.description.trim());
    payload.append("category", formData.category);
    payload.append("technologies", JSON.stringify(formData.technologies.split(",").map((item) => item.trim()).filter(Boolean)));
    payload.append("project_url", formData.project_url.trim());
    payload.append("github_url", formData.github_url.trim());
    payload.append("is_featured", String(formData.is_featured));
    if (selectedFile) payload.append("image", selectedFile);

    setIsWorking(true);
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Project updated successfully!");
      } else {
        await api.post("/projects", payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Project added successfully!");
      }
      closeForm();
      await fetchProjects();
    } catch (error) {
      toast.error(getRequestError(error, editingId ? "Failed to update project" : "Failed to add project"));
    } finally {
      setIsWorking(false);
    }
  };

  const deleteProject = async () => {
    setIsWorking(true);
    try {
      await api.delete(`/projects/${confirmId}`);
      setProjects((current) => current.filter((project) => project.id !== confirmId));
      toast.success("Project deleted successfully!");
    } catch (error) {
      toast.error(getRequestError(error, "Failed to delete project"));
    } finally {
      setIsWorking(false);
      setConfirmId(null);
    }
  };

  return (
    <section className="projects-section">
      <div className="projects-container">
        <header className="projects-heading">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2>My Projects</h2>
            <p className="projects-intro">A collection of projects, ideas, and solutions I have worked on.</p>
          </div>
          {isAdmin && <button type="button" className="add-btn" onClick={() => setIsEditing(true)} disabled={isWorking}>+ Add Project</button>}
        </header>

        <div className="projects-filters" aria-label="Filter projects by category">
          {["All", ...PROJECT_CATEGORIES].map((category) => (
            <button type="button" key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>
              {category}
            </button>
          ))}
        </div>

        {isWorking && !isEditing && <LoadingSpinner label="Updating projects..." />}
        {loading ? <LoadingSpinner label="Loading projects..." /> : (
          <div className="projects-grid">
            {visibleProjects.length === 0 ? (
              <div className="empty-state"><span>✦</span><p>{projects.length ? "No projects in this category yet." : "Projects will appear here soon."}</p></div>
            ) : visibleProjects.map((project) => (
              <article className={`project-card${project.is_featured ? " featured" : ""}`} key={project.id}>
                <div className="project-image-wrap">
                  {project.image_url ? <img className="project-image" src={assetUrl(project.image_url)} alt={`${project.title} preview`} loading="lazy" /> : <div className="project-image-placeholder" aria-label="No project preview image">Project preview</div>}
                  {project.is_featured && <span className="project-featured">Featured</span>}
                </div>
                <div className="project-content">
                  <span className="project-category">{project.category}</span>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                    <ul className="project-tech-list" aria-label="Technologies">
                      {project.technologies.map((technology) => <li key={`${project.id}-${technology}`}>{technology}</li>)}
                    </ul>
                  )}
                  <div className="project-actions">
                    {project.project_url && <a className="view-btn" href={project.project_url} target="_blank" rel="noreferrer">View Project <span aria-hidden="true">↗</span></a>}
                    {project.github_url && <a className="project-github-link" href={project.github_url} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>}
                  </div>
                  {isAdmin && <div className="project-admin-actions">
                    <button type="button" className="edit-btn-small" onClick={() => startEditing(project)}>Edit</button>
                    <button type="button" className="delete-btn-small" onClick={() => setConfirmId(project.id)}>Delete</button>
                  </div>}
                </div>
              </article>
            ))}
          </div>
        )}

        {isEditing && isAdmin && <Modal title={editingId ? "Edit project" : "Add project"} onClose={closeForm}>
          <form className="projects-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="project-title">Project title *</label>
              <input id="project-title" name="title" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} maxLength="255" required />
            </div>
            <div className="form-group">
              <label htmlFor="project-description">Description *</label>
              <textarea id="project-description" name="description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} rows="4" maxLength="5000" required />
            </div>
            <div className="form-group">
              <label htmlFor="project-category">Category *</label>
              <select id="project-category" name="category" value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })}>
                {PROJECT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="project-technologies">Technologies and tools</label>
              <input id="project-technologies" name="technologies" value={formData.technologies} onChange={(event) => setFormData({ ...formData, technologies: event.target.value })} placeholder="React, Flask, MySQL" />
              <small>Separate items with commas.</small>
            </div>
            <div className="form-group">
              <label htmlFor="project-url">Live project URL *</label>
              <input id="project-url" name="project_url" type="url" value={formData.project_url} onChange={(event) => setFormData({ ...formData, project_url: event.target.value })} placeholder="https://example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="project-github">GitHub repository URL</label>
              <input id="project-github" name="github_url" type="url" value={formData.github_url} onChange={(event) => setFormData({ ...formData, github_url: event.target.value })} placeholder="https://github.com/username/repository" />
            </div>
            <div className="form-group">
              <label htmlFor="project-image">Preview image {editingId ? "(optional; keep existing image if unchanged)" : "(optional)"}</label>
              <input id="project-image" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
              {editingId && !selectedFile && projects.find((project) => project.id === editingId)?.image_url && <p className="project-current-image">Current preview will be kept unless replaced.</p>}
            </div>
            <label className="project-featured-toggle"><input type="checkbox" checked={formData.is_featured} onChange={(event) => setFormData({ ...formData, is_featured: event.target.checked })} /> Mark as featured</label>
            {isWorking && <LoadingSpinner label={editingId ? "Saving project..." : "Adding project..."} />}
            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={isWorking}>{editingId ? "Save Changes" : "Add Project"}</button>
              <button type="button" className="cancel-btn" onClick={closeForm} disabled={isWorking}>Cancel</button>
            </div>
          </form>
        </Modal>}

        {confirmId !== null && <ConfirmDialog title="Delete project" message="This project will be permanently removed. Continue?" confirmLabel="Delete project" busy={isWorking} onCancel={() => setConfirmId(null)} onConfirm={deleteProject} />}
      </div>
    </section>
  );
};

export default Projects;
