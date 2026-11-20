import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { publicApi } from "../api";
import Profile from "./Profile";
import CV from "./CV";
import Certificates from "./Certificates";
import Gallery from "./Gallery";
import Projects from "./Projects";
import LoadingSpinner from "./LoadingSpinner";
import "../styles/ShareLinks.css";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "cv", label: "CV & Experience" },
  { id: "certificates", label: "Certificates" },
  { id: "gallery", label: "Gallery" },
  { id: "projects", label: "My Projects" },
];

const ERROR_STATES = {
  not_found: {
    title: "Portfolio Link Not Found",
    message: "This portfolio sharing link does not exist.",
  },
  expired: {
    title: "Portfolio Link Expired",
    message: "This portfolio sharing link has expired.",
  },
  disabled: {
    title: "Portfolio Link Disabled",
    message: "This portfolio sharing link is no longer available.",
  },
  network: {
    title: "Unable to Check This Link",
    message: "We could not reach the portfolio server. Please try again in a moment.",
  },
};

/**
 * Public /share/:token page. Validates the token WITHOUT the admin
 * interceptor (publicApi) and, when valid, renders the same portfolio
 * section components with admin access disabled.
 */
const SharePage = ({ token }) => {
  const [phase, setPhase] = useState("checking"); // checking | ready | error
  const [errorKey, setErrorKey] = useState(null);
  const [retry, setRetry] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!token) {
      setErrorKey("not_found");
      setPhase("error");
      return undefined;
    }
    let cancelled = false;
    setPhase("checking");
    publicApi
      .get(`/share-links/${encodeURIComponent(token)}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data.status === "success") {
          setPhase("ready");
        } else {
          setErrorKey("network");
          setPhase("error");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 404) setErrorKey("not_found");
        else if (status === 410) setErrorKey("expired");
        else if (status === 403) setErrorKey("disabled");
        else {
          setErrorKey("network");
          toast.error("We could not reach the portfolio server right now.");
        }
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token, retry]);

  if (phase === "checking") {
    return (
      <main className="share-state-page">
        <LoadingSpinner label="Checking portfolio link..." />
      </main>
    );
  }

  if (phase === "error") {
    const state = ERROR_STATES[errorKey] || ERROR_STATES.network;
    return (
      <main className="share-state-page">
        <div className="share-error-card">
          <p className="eyebrow">Shared portfolio</p>
          <h1>{state.title}</h1>
          <p>{state.message}</p>
          {errorKey === "network" && (
            <div className="share-state-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setRetry((n) => n + 1)}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="share-shell">
      <header className="share-header">
        <div className="share-header-inner">
          <p className="eyebrow">Shared portfolio</p>
        </div>
      </header>
      <div className="share-tabs">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`nav-btn ${activeTab === section.id ? "active" : ""}`}
            onClick={() => setActiveTab(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
      <main className="content">
        {activeTab === "profile" && <Profile isAdmin={false} />}
        {activeTab === "cv" && <CV isAdmin={false} />}
        {activeTab === "certificates" && <Certificates isAdmin={false} />}
        {activeTab === "gallery" && <Gallery isAdmin={false} />}
        {activeTab === "projects" && <Projects isAdmin={false} />}
      </main>
      <footer className="footer share-footer">
        <p>Shared portfolio · © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default SharePage;