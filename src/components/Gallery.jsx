import React, { useState, useEffect } from "react";
import api, { assetUrl } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import AssetPreview from "./AssetPreview";
import "../styles/Gallery.css";

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
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
      await fetchPhotos();
    } catch (_err) {
      // A spinner is shown while an upload is in progress.
    } finally {
      setIsWorking(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        setIsWorking(true);
        await api.delete(`/gallery/${id}`);
        await fetchPhotos();
      } catch (_err) {
        // Keep the current gallery when deletion cannot be completed.
      } finally {
        setIsWorking(false);
      }
    }
  };

  return (
    <section className="gallery-section">
      <div className="gallery-container">
        <h2>Gallery - Graduation & Moments</h2>

        <button onClick={() => setIsUploading(true)} className="upload-btn" disabled={isWorking}>
          + Upload Photo
        </button>

        {isWorking && !isUploading && <LoadingSpinner label="Updating gallery..." />}

        {isUploading && (
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
        )}

        {loading ? <LoadingSpinner label="Loading gallery..." /> : <div className="gallery-grid">
          {photos.length === 0 ? (
            <p className="no-photos">
              No photos yet. Upload your first memory!
            </p>
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
                  <button
                    onClick={() => handleDelete(photo.id)}
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

export default Gallery;
