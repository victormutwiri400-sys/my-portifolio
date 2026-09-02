import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { assetUrl, getRequestError } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import AssetPreview, { isPdf } from "./AssetPreview";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import Lightbox from "./Lightbox";
import "../styles/Certificates.css";

const Certificates = ({ isAdmin }) => {
  const [certificates, setCertificates] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
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
      toast.success("Certificate uploaded successfully!");
      await fetchCertificates();
    } catch (err) {
      toast.error(getRequestError(err, "Failed to upload certificate"));
    } finally {
      setIsWorking(false);
    }
  };

  const deleteCertificate = async () => {
    setIsWorking(true);
    try {
      await api.delete(`/certificates/${confirmId}`);
      toast.success("Certificate deleted successfully!");
      await fetchCertificates();
    } catch (err) {
      toast.error(getRequestError(err, "Failed to delete certificate"));
    } finally {
      setIsWorking(false);
      setConfirmId(null);
    }
  };

  return (
    <section className="certificates-section">
      <div className="certificates-container">
        <h2>Certificates & Achievements</h2>

        {isAdmin && <button onClick={() => setIsUploading(true)} className="upload-btn" disabled={isWorking}>
          + Upload Certificate
        </button>}

        {isWorking && !isUploading && <LoadingSpinner label="Updating certificates..." />}

        {isUploading && (
          <Modal title="Upload certificate" onClose={() => setIsUploading(false)}>
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
          </Modal>
        )}

        {loading ? <LoadingSpinner label="Loading certificates..." /> : <div className="certificates-grid">
          {certificates.length === 0 ? (
            <div className="empty-state"><span>⌑</span><p>No certificates added yet. {isAdmin && "Click above to upload!"}</p></div>
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
                  <div className="info-actions">
                    {!isPdf(cert.image_url) && (
                      <button
                        className="view-btn"
                        onClick={() =>
                          setLightbox({ src: assetUrl(cert.image_url), title: cert.title })
                        }
                      >
                        <span aria-hidden="true">⤢</span> View Full Image
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setConfirmId(cert.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>}

        {confirmId !== null && (
          <ConfirmDialog
            title="Delete certificate"
            message="This certificate will be permanently removed. Continue?"
            confirmLabel="Delete certificate"
            busy={isWorking}
            onCancel={() => setConfirmId(null)}
            onConfirm={deleteCertificate}
          />
        )}

        {lightbox && (
          <Lightbox
            src={lightbox.src}
            title={lightbox.title}
            onClose={() => setLightbox(null)}
          />
        )}
      </div>
    </section>
  );
};

export default Certificates;
