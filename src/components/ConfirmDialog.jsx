import Modal from "./Modal";

/**
 * Replaces window.confirm so destructive actions stay inside a styled,
 * blur-backdrop dialog instead of a browser alert box.
 */
const ConfirmDialog = ({
  title = "Confirm action",
  message,
  confirmLabel = "Delete",
  busy = false,
  onCancel,
  onConfirm,
}) => (
  <Modal title={title} onClose={onCancel}>
    <p className="confirm-message">{message}</p>
    <div className="button-group">
      <button type="button" className="confirm-btn" onClick={onConfirm} disabled={busy}>
        {confirmLabel}
      </button>
      <button type="button" className="cancel-btn" onClick={onCancel} disabled={busy}>
        Cancel
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;