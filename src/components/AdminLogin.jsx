import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import LoadingSpinner from "./LoadingSpinner";
import "../styles/AdminLogin.css";

const AdminLogin = ({ onLogin }) => {
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const value = token.trim();
    if (!value || checking) return;

    setChecking(true);
    try {
      // Verify against the API first so a wrong token never unlocks the UI.
      await api.post("/admin/login", { token: value });
      toast.success("Welcome back, admin!");
      onLogin(value);
    } catch (_err) {
      toast.error("That admin token was rejected by the server.");
      setToken("");
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <p className="eyebrow">Portfolio administration</p>
        <h1>Admin access</h1>
        <p>Enter the admin token configured on your API server.</p>
        <label htmlFor="admin-token">Admin token</label>
        <input id="admin-token" type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="current-password" required disabled={checking} />
        <button className="primary-button" type="submit" disabled={checking}>
          {checking ? <LoadingSpinner label="Verifying token..." /> : "Unlock management"}
        </button>
      </form>
    </main>
  );
};

export default AdminLogin;
