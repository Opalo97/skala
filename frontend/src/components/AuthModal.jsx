import { useNavigate } from "react-router-dom";
import { BiUserPlus, BiLogIn, BiX } from "react-icons/bi";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRegister = () => {
    navigate("/register");
    onClose();
  };

  const handleLogin = () => {
    navigate("/login");
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <BiX size={28} />
        </button>
        
        <div className="auth-modal-content">
          <h2>Elige una opción</h2>
          
          <div className="auth-modal-buttons">
            <button className="auth-btn register-btn" onClick={handleRegister}>
              <BiUserPlus size={24} />
              Registrarse
            </button>
            
            <button className="auth-btn login-btn" onClick={handleLogin}>
              <BiLogIn size={24} />
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
