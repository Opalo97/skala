import { useNavigate } from "react-router-dom";
import { BiPaint, BiBox } from "react-icons/bi";
import "./CreateModal.css";

export default function CreateModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleCreateInspiracion = () => {
    navigate("/crear-inspiracion");
    onClose();
  };

  const handleUploadProduct = () => {
    navigate("/upload");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="create-modal">
        <div className="modal-header">
          <h2>¿Qué deseas crear?</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* Opción 1: Crear Inspiración */}
          <div 
            className="create-option inspiration-option"
            onClick={handleCreateInspiracion}
          >
            <div className="option-icon">
              <BiPaint size={40} />
            </div>
            <h3>Crear Inspiración</h3>
            <p>Comparte diseños, estilos y espacios que inspiren a otros</p>
            <button className="option-button">Crear</button>
          </div>

          {/* Opción 2: Subir Producto */}
          <div 
            className="create-option product-option"
            onClick={handleUploadProduct}
          >
            <div className="option-icon">
              <BiBox size={40} />
            </div>
            <h3>Subir Producto</h3>
            <p>Vende tus productos y objetos en el marketplace</p>
            <button className="option-button">Subir</button>
          </div>
        </div>
      </div>
    </>
  );
}
