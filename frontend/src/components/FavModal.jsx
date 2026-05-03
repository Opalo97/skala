import { useNavigate } from "react-router-dom";
import { BiPlus, BiHeart, BiX } from "react-icons/bi";
import "./AuthModal.css";

export default function FavModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const goToColecciones = () => {
    navigate('/colecciones-destacadas');
    onClose();
  };

  const goToListas = () => {
    navigate('/listas-destacadas');
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <BiX size={28} />
        </button>

        <div className="auth-modal-content">
          <h2>Elige una sección destacada</h2>
       

          <div className="auth-modal-buttons">
            <button className="auth-btn register-btn" onClick={goToColecciones}>
              <BiPlus size={20} />
              Colecciones destacadas
            </button>

            <button className="auth-btn login-btn" onClick={goToListas}>
              <BiHeart size={20} />
              Listas destacadas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
