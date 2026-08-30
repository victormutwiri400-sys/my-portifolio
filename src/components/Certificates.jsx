import React, { useState, useEffect } from "react";
import api, { assetUrl } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import AssetPreview from "./AssetPreview";
import "../styles/Certificates.css";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get("/certificates");
      if (response.data.status === "success") {
        setCertificates(response.data.data || []);
      }
    } catch (_err) {
      // Leave the current certificate list in place if a refresh fails.
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) return;
    setIsWorking(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("issuer", formData.issuer);
      formDataToSend.append("image", selectedFile);

      await api.post(
        "/certificates",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setFormData({ title: "", issuer: "" });
      setSelectedFile(null);
      setIsUploading(false);
      await fetchCertificates();
    } catch (_err) {
      // A spinner is shown while an upload is in progress.
    } finally {
      setIsWorking(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      try {
        setIsWorking(true);
        await api.delete(`/certificates/${id}`);
        await fetchCertificates();
      } catch (_err) {
        // Keep the current list when deletion cannot be completed.
      } finally {
        setIsWorking(false);
      }
    }
  };

  return (
    <section className="certificates-section">
      <div className="certificates-container">
        <h2>Certificates & Achievements</h2>

        <button onClick={() => setIsUploading(true)} className="upload-btn" disabled={isWorking}>
          + Upload Certificate
        </button>

        {isWorking && !isUploading && <LoadingSpinner label="Updating certificates..." />}

        {isUploading && (
          <form onSubmit={handleSubmit} className="certificates-form">
            <div className="form-group">
              <label>Certificate Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., AWS Solutions Architect"
                required
              />
            </div>

            <div className="form-group">
              <label>Issuer</label>
              <input
                type="text"
                name="issuer"
                value={formData.issuer}
                onChange={handleInputChange}
                placeholder="e.g., Amazon Web Services"
              />
            </div>

            <div className="form-group">
              <label>Certificate Image *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                required
              />
            </div>

            {isWorking && <LoadingSpinner label="Uploading certificate..." />}

            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={isWorking}>
                Upload Certificate
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUploading(false);
                  setFormData({ title: "", issuer: "" });
                  setSelectedFile(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? <LoadingSpinner label="Loading certificates..." /> : <div className="certificates-grid">
          {certificates.length === 0 ? (
            <p className="no-certificates">
              No certificates yet. Upload your first one!
            </p>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} className="certificate-card">
                <div className="cert-image-container">
                  <AssetPreview
                    src={assetUrl(cert.image_url)}
                    alt={cert.title}
                    className="cert-image"
                    pdfLabel="Open certificate PDF"
                  />
                </div>
                <div className="cert-info">
                  <h3>{cert.title}</h3>
                  {cert.issuer && <p className="issuer">{cert.issuer}</p>}
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>}
      </div>
    </section>
  );
};

export default Certificates;
