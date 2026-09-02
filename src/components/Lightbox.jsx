import { useEffect } from "react";
import "../styles/Lightbox.css";

/**
 * Full-screen image lightbox. Closes via the × button, clicking the backdrop,
 * or pressing Escape. Locks body scroll while open.
 */
const Lightbox = ({ src, alt, title, onClose }) => {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Full image preview"}
    >
      <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
        <button className="lightbox-close" type="button" onClick={onClose} aria-label="Close image preview">
          ×
        </button>
        <img src={src} alt={alt || title || "Full image"} />
        {title && <p className="lightbox-caption">{title}</p>}
      </div>
    </div>
  );
};

export default Lightbox;