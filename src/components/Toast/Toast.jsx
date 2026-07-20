import React, { useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import './Toast.css';

const Toast = () => {
  const { toasts, removeToast } = useContext(ShopContext);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type || 'success'}`}>
          <div className="toast-icon">
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
            {(!toast.type || toast.type === 'success') && <CheckCircle size={18} />}
          </div>
          <p className="toast-message">{toast.message}</p>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
