import React, { useState, useCallback } from "react";

const ToastContext = React.createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-blue-500";

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 animate-slide-in`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 font-bold hover:opacity-80">
        ×
      </button>
    </div>
  );
};

export default ToastContext;
