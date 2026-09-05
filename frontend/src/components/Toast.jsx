import { CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = "success" } = toast;

  const isWarning = type === "warning";
  const isError = type === "error";

  return (
    <div
      className={`toast-container ${
        isError ? "toast-error" : isWarning ? "toast-warning" : "toast-success"
      }`}
      role="alert"
    >
      <div className="toast-icon">
        {isError ? (
          <AlertCircle size={17} />
        ) : isWarning ? (
          <AlertTriangle size={17} />
        ) : (
          <CheckCircle2 size={17} />
        )}
      </div>

      <div className="toast-message">{message}</div>

      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default Toast;
