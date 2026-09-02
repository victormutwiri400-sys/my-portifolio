import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { getRequestError } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/ShareLinks.css";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Build the backend-expected `YYYY-MM-DDTHH:MM:SS` string from the separate
 * date and time inputs. Leaving the time empty defaults to end of day.
 */
const buildExpiresAt = (date, time) => {
  const [y, m, d] = date.split("-");
  let hh = "23";
  let mm = "59";
  let ss = "59";
  if (time) {
    const parts = time.split(":");
    hh = parts[0];
    mm = parts[1] || "00";
    ss = parts[2] || "00";
  }
  return `${y}-${m}-${d}T${pad(Number(hh))}:${pad(Number(mm))}:${pad(Number(ss))}`;
};

const formatDate = (iso) => (iso ? iso.replace("T", " ") : "—");

const shareUrl = (sharePath) => `${window.location.origin}${sharePath}`;

const ShareLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [created, setCreated] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");

  const fetchLinks = async () => {
    try {
      const response = await api.get("/share-links");
      if (response.data.status === "success") {
        setLinks(response.data.data || []);
      }
    } catch (err) {
      toast.error(getRequestError(err, "Failed to load share links"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const copyLink = async (sharePath) => {
    const url = shareUrl(sharePath);
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch (_err) {
      // clipboard API unavailable (older browsers / insecure context).
    }
    if (!copied) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        copied = true;
      } catch (_err) {
        // Nothing else we can do — keep the toast informative.
      }
    }
    toast.success(copied ? "Share link copied!" : "Copy failed — please copy the link manually.");
  };

  const createShareLink = async (event) => {
    event.preventDefault();
    const date = expiryDate.trim();
    if (!date) {
      toast.error("Please choose an expiry date.");
      return;
    }
    const expires_at = buildExpiresAt(date, expiryTime);
    const parsed = new Date(expires_at);
    if (Number.isNaN(parsed.getTime()) || parsed <= new Date()) {
      toast.error("Expiry must be in the future.");
      return;
    }
    setIsCreating(true);
    try {
      const response = await api.post("/share-links", { expires_at });
      if (response.data.status === "success") {
        setCreated(response.data.data);
        toast.success("Share link created successfully!");
        setExpiryDate("");
        setExpiryTime("");
        await fetchLinks();
      }
    } catch (err) {
      toast.error(getRequestError(err, "Failed to create share link"));
    } finally {
      setIsCreating(false);
    }
  };

  const disableLink = async () => {
    setIsWorking(true);
    try {
      await api.delete(`/share-links/${confirmId}`);
      toast.success("Share link disabled successfully!");
      await fetchLinks();
    } catch (err) {
      toast.error(getRequestError(err, "Failed to disable share link"));
    } finally {
      setIsWorking(false);
      setConfirmId(null);
    }
  };

  const closeCreate = () => {
    setShowCreate(false);
    setExpiryDate("");
    setExpiryTime("");
  };

  return (
    <section className="share-links-section">
      <div className="share-links-container">
        <h2>Share Portfolio</h2>
        <p className="section-hint">
          Create expiring links that let anyone view your portfolio without
          admin access.
        </p>

        <button
          type="button"
          className="upload-btn"
          onClick={() => setShowCreate(true)}
          disabled={isCreating || isWorking}
        >
          + Create Share Link
        </button>

        {loading ? (
          <LoadingSpinner label="Loading share links..." />
        ) : (
          <div className="share-link-list">
            {links.length === 0 ? (
              <div className="empty-state">
                <span>↗</span>
                <p>No share links created yet.</p>
              </div>
            ) : (
              links.map((link) => (
                <div key={link.id} className={`share-link-row status-${link.status}`}>
                  <div className="share-link-url">
                    <a
                      href={shareUrl(link.share_path)}
                      target="_blank"
                      rel="noreferrer"
                      title={shareUrl(link.share_path)}
                    >
                      {shareUrl(link.share_path)}
                    </a>
                  </div>
                  <div className="share-link-meta">
                    <span>Created: {formatDate(link.created_at)}</span>
                    <span>Expires: {formatDate(link.expires_at)}</span>
                  </div>
                  <span className={`status-badge badge-${link.status}`}>
                    {link.status.toUpperCase()}
                  </span>
                  <div className="share-link-actions">
                    <button
                      type="button"
                      className="view-btn"
                      onClick={() => copyLink(link.share_path)}
                    >
                      Copy
                    </button>
                    {link.status === "active" && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => setConfirmId(link.id)}
                      >
                        Disable Link
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showCreate && created && (
          <Modal title="Share link created" onClose={() => closeCreate()}>
            <p className="created-hint">
              Share this URL so anyone can view your portfolio before it
              expires.
            </p>
            <div className="created-link-box">
              <span>{shareUrl(created.share_path)}</span>
              <button
                type="button"
                className="view-btn"
                onClick={() => copyLink(created.share_path)}
              >
                Copy Link
              </button>
            </div>
            <div className="button-group">
              <button
                type="button"
                className="submit-btn"
                onClick={() => closeCreate()}
              >
                Done
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setCreated(null)}
              >
                Create Another
              </button>
            </div>
          </Modal>
        )}

        {showCreate && !created && (
          <Modal title="Create share link" onClose={() => closeCreate()}>
            <form onSubmit={createShareLink} className="share-link-form">
              <p className="created-hint">
                The link will stop working after the expiry date and time.
              </p>
              <div className="form-group">
                <label htmlFor="share-expiry-date">Expiry date *</label>
                <input
                  id="share-expiry-date"
                  type="date"
                  value={expiryDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(event) => setExpiryDate(event.target.value)}
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="share-expiry-time">Expiry time</label>
                <input
                  id="share-expiry-time"
                  type="time"
                  value={expiryTime}
                  onChange={(event) => setExpiryTime(event.target.value)}
                  disabled={isCreating}
                />
                <p className="field-hint">
                  Optional — defaults to 23:59:59 on the selected date.
                </p>
              </div>

              {isCreating && <LoadingSpinner label="Creating share link..." />}

              <div className="button-group">
                <button type="submit" className="submit-btn" disabled={isCreating}>
                  Create Link
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => closeCreate()}
                  disabled={isCreating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {confirmId !== null && (
          <ConfirmDialog
            title="Disable share link"
            message="This link will be permanently revoked. Anyone using it will no longer be able to view your portfolio. Continue?"
            confirmLabel="Disable"
            busy={isWorking}
            onCancel={() => setConfirmId(null)}
            onConfirm={disableLink}
          />
        )}
      </div>
    </section>
  );
};

export default ShareLinks;