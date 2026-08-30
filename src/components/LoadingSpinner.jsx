import "../styles/LoadingSpinner.css";

const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="loading-spinner" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export default LoadingSpinner;
