import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { assetUrl, getRequestError } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import AssetPreview, { isPdf } from "./AssetPreview";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import Lightbox from "./Lightbox";
import "../styles/Gallery.css";

const Gallery = ({ isAdmin }) => {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get("/gallery");
      if (response.data.status === "success") {
        setPhotos(response.data.data || []);
      }
    } catch (_err) {
      // Keep the current gallery visible if a refresh fails.
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) return;
    setIsWorking(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("image", selectedFile);

      await api.post("/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCaption("");
      setSelectedFile(null);
      setIsUploading(false);
      toast.success("Photo added to gallery successfully!");
      await fetchPhotos();
    } catch (err) {
      toast.error(getRequestError(err, "Failed to upload photo"));
    } finally {
      setIsWorking(false);
    }
  };

  const deletePhoto = async () => {
    setIsWorking(true);
    try {
      await api.delete(`/gallery/${confirmId}`);
      toast.success("Photo deleted successfully!");
      await fetchPhotos();
    } catch (err) {
      toast.error(getRequestError(err, "Failed to delete photo"));
    } finally {
      setIsWorking(false);
      setConfirmId(null);
    }
  };

  return (
    <section className="gallery-section">
      <div className="gallery-container">
        <h2>Gallery - Graduation & Moments</h2>

        {isAdmin && <button onClick={() => setIsUploading(true)} className="upload-btn" disabled={isWorking}>
          + Upload Photo
        </button>}

        {isWorking && !isUploading && <LoadingSpinner label="Updating gallery..." />}

        {isUploading && (
          <Modal title="Upload gallery item" onClose={() => setIsUploading(false)}>
          <form onSubmit={handleSubmit} className="gallery-form">
            <div className="form-group">
              <label>Photo Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g., Graduation Day 2024"
              />
            </div>

            <div className="form-group">
              <label>Select Photo *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                required
              />
            </div>

            {isWorking && <LoadingSpinner label="Uploading photo..." />}

            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={isWorking}>
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUploading(false);
                  setCaption("");
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

        {loading ? <LoadingSpinner label="Loading gallery..." /> : <div className="gallery-grid">
          {photos.length === 0 ? (
            <div className="empty-state"><span>◫</span><p>No gallery items added yet. {isAdmin && "Click above to upload!"}</p></div>
          ) : (
            photos.map((photo) => (
              <div key={photo.id} className="gallery-item">
                <div className="photo-wrapper">
                  <AssetPreview
                    src={assetUrl(photo.image_url)}
                    alt={photo.caption || "Gallery photo"}
                    className="gallery-photo"
                    pdfLabel="Open gallery PDF"
                  />
                </div>
                <div className="photo-info">
                  {photo.caption && <p className="caption">{photo.caption}</p>}
                  <div className="info-actions">
                    {!isPdf(photo.image_url) && (
                      <button
                        className="view-btn"
                        onClick={() =>
                          setLightbox({ src: assetUrl(photo.image_url), title: photo.caption || "Gallery photo" })
                        }
                      >
                        <span aria-hidden="true">⤢</span> View Full Image
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setConfirmId(photo.id)}
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
            title="Delete gallery item"
            message="This photo will be permanently removed from your gallery. Continue?"
            confirmLabel="Delete photo"
            busy={isWorking}
            onCancel={() => setConfirmId(null)}
            onConfirm={deletePhoto}
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

export default Gallery;
