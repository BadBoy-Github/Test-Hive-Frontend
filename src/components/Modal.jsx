import { useState } from 'react';

const Modal = ({ isOpen, onClose, title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel', type = 'info' }) => {
  if (!isOpen) return null;

  const getButtonStyles = (buttonType) => {
    switch (buttonType) {
      case 'cancel':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'update':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'confirm':
      case 'save':
      case 'create':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          {onConfirm && (
            <>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded ${getButtonStyles('cancel')}`}
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 rounded ${getButtonStyles(type)}`}
              >
                {confirmText}
              </button>
            </>
          )}
          {!onConfirm && (
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded ${getButtonStyles('confirm')}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for using modal
export const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    type: 'info'
  });

  const showModal = (config) => {
    setModalState({
      isOpen: true,
      title: config.title || 'Alert',
      message: config.message || '',
      onConfirm: config.onConfirm || null,
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      type: config.type || 'info'
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    modal: <Modal {...modalState} onClose={hideModal} />,
    showModal,
    hideModal
  };
};

export default Modal;