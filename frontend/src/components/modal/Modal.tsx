import "./Modal.css";

interface ModalType {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: ModalType) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        {children}
      </div>
    </div>
  );
};

export default Modal;
