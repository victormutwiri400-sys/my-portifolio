import "../styles/Modal.css";

const Modal = ({ title, onClose, children }) => (
  <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <header className="modal-header">
        <h2>{title}</h2>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">×</button>
      </header>
      {children}
    </section>
  </div>
);

export default Modal;
