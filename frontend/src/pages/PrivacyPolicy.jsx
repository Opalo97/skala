import "./PrivacyPolicy.css";

const sections = [
  {
    number: "1",
    title: "INTRODUCCIÓN",
    content: (
      <>
        <p>Bienvenido/a a SKALA Architects & Designers (en adelante, "SKALA").</p>
        <p>Para nosotros es fundamental proteger tu privacidad y garantizar la seguridad de tus datos personales. La presente Política de Privacidad explica cómo recopilamos, utilizamos, compartimos y protegemos la información de los usuarios que acceden y utilizan nuestra plataforma web.</p>
        <p>Al registrarte y utilizar SKALA, aceptas los términos descritos en este documento. Te recomendamos leerlo detenidamente.</p>
      </>
    ),
  },
  {
    number: "2",
    title: "RESPONSABLE DEL TRATAMIENTO",
    content: (
      <>
        <p>El responsable del tratamiento de tus datos personales es SKALA Architects & Designers (en adelante, "SKALA" o "nosotros").</p>
        <p>Para cualquier cuestión relacionada con la privacidad o el tratamiento de datos personales, puedes contactarnos en:</p>
        <p className="email">✉ privacidad@skala.com</p>
      </>
    ),
  },
  {
    number: "3",
    title: "INFORMACIÓN QUE RECOPILAMOS",
    content: (
      <>
        <p>Recopilamos los siguientes tipos de datos personales:</p>
        <p><strong>3.1 Datos que nos proporcionas directamente</strong></p>
        <ul>
          <li>Nombre de usuario y contraseña al registrarte.</li>
          <li>Dirección de correo electrónico.</li>
          <li>Foto de perfil y descripción personal (opcionales).</li>
          <li>Contenido que publicas: inspiraciones, colecciones, productos y comentarios.</li>
        </ul>
        <p><strong>3.2 Datos que recopilamos automáticamente</strong></p>
        <ul>
          <li>Dirección IP y datos de navegación.</li>
          <li>Tipo de dispositivo y navegador utilizado.</li>
          <li>Páginas visitadas y tiempo de permanencia en la plataforma.</li>
          <li>Interacciones con el contenido (guardados, búsquedas, likes).</li>
        </ul>
        <p><strong>3.3 Datos de terceros</strong></p>
        <p>Si accedes mediante una cuenta de Google u otro proveedor externo, podemos recibir información básica de perfil según los permisos que otorgues.</p>
      </>
    ),
  },
  {
    number: "4",
    title: "FINALIDAD DEL TRATAMIENTO DE LOS DATOS",
    content: (
      <>
        <p>Utilizamos la información recopilada exclusivamente para los siguientes fines:</p>
        <p><strong>4.1 Gestión de tu cuenta</strong></p>
        <p>Permitir el acceso seguro a la plataforma y gestionar tu perfil.</p>
        <p><strong>4.2 Prestación del servicio principal</strong></p>
        <ul>
          <li>Alojar y mostrar el contenido que subes.</li>
          <li>Permitir la creación y organización de colecciones.</li>
          <li>Facilitar la interacción con otros usuarios.</li>
        </ul>
        <p><strong>4.3 Personalización de la experiencia</strong></p>
        <p>Analizar tus interacciones (guardados, búsquedas, preferencias) para:</p>
        <ul>
          <li>Adaptar el feed de inicio ("Inicio").</li>
          <li>Recomendar inspiraciones, muebles y distribuciones acordes a tus gustos.</li>
        </ul>
        <p><strong>4.4 Comunicación</strong></p>
        <p>Enviarte:</p>
        <ul>
          <li>Notificaciones sobre actualizaciones de la plataforma.</li>
          <li>Cambios en nuestras políticas.</li>
          <li>Alertas relacionadas con la seguridad.</li>
        </ul>
        <p><strong>4.5 Mejora de la plataforma</strong></p>
        <p>Realizar análisis estadísticos internos para optimizar:</p>
        <ul>
          <li>Experiencia de usuario (UX/UI).</li>
          <li>Rendimiento técnico de la plataforma.</li>
        </ul>
      </>
    ),
  },
  {
    number: "5",
    title: "BASE LEGAL DEL TRATAMIENTO",
    content: (
      <>
        <p>El tratamiento de tus datos se basa en:</p>
        <ul>
          <li><strong>Ejecución de un contrato:</strong> para prestarte el servicio al que te has registrado.</li>
          <li><strong>Consentimiento:</strong> para el envío de comunicaciones y personalización.</li>
          <li><strong>Interés legítimo:</strong> para la mejora y seguridad de la plataforma.</li>
        </ul>
      </>
    ),
  },
  {
    number: "6",
    title: "CONSERVACIÓN DE LOS DATOS",
    content: (
      <>
        <p>Conservaremos tus datos personales mientras mantengas una cuenta activa en SKALA. Si decides eliminar tu cuenta, tus datos serán suprimidos en un plazo máximo de <strong>30 días</strong>, salvo que exista una obligación legal que requiera su conservación.</p>
      </>
    ),
  },
  {
    number: "7",
    title: "COMPARTICIÓN DE DATOS CON TERCEROS",
    content: (
      <>
        <p>SKALA no vende ni cede tus datos personales a terceros con fines comerciales. Únicamente los compartimos con:</p>
        <ul>
          <li><strong>Proveedores de servicios técnicos</strong> (almacenamiento en la nube, hosting de imágenes como Cloudinary).</li>
          <li><strong>Servicios de analítica</strong> para uso interno y agregado.</li>
          <li><strong>Autoridades competentes</strong>, si así lo exige la legislación aplicable.</li>
        </ul>
        <p>Todos los proveedores están obligados contractualmente a tratar tus datos con la misma confidencialidad que SKALA.</p>
      </>
    ),
  },
  {
    number: "8",
    title: "TRANSFERENCIAS INTERNACIONALES",
    content: (
      <>
        <p>Algunos de nuestros proveedores técnicos pueden estar ubicados fuera del Espacio Económico Europeo. En dichos casos, garantizamos que las transferencias se realizan con las garantías adecuadas conforme al Reglamento General de Protección de Datos (RGPD).</p>
      </>
    ),
  },
  {
    number: "9",
    title: "TUS DERECHOS",
    content: (
      <>
        <p>Como usuario, tienes derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> consultar qué datos tuyos tratamos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> solicitar la eliminación de tus datos ("derecho al olvido").</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento en determinadas circunstancias.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado.</li>
          <li><strong>Limitación:</strong> solicitar que restrinjamos el tratamiento de tus datos.</li>
        </ul>
        <p>Para ejercer cualquiera de estos derechos, escríbenos a <strong>privacidad@skala.com</strong> indicando tu nombre de usuario y el derecho que deseas ejercer. Responderemos en un plazo máximo de <strong>30 días</strong>.</p>
      </>
    ),
  },
  {
    number: "10",
    title: "SEGURIDAD DE LOS DATOS",
    content: (
      <>
        <p>Aplicamos medidas técnicas y organizativas para proteger tus datos frente a accesos no autorizados, pérdida o alteración, entre ellas:</p>
        <ul>
          <li>Cifrado de contraseñas.</li>
          <li>Conexiones seguras mediante HTTPS.</li>
          <li>Acceso restringido a los datos por parte del equipo interno.</li>
        </ul>
      </>
    ),
  },
  {
    number: "11",
    title: "COOKIES",
    content: (
      <>
        <p>SKALA utiliza cookies propias y de terceros para mejorar la experiencia de navegación. Puedes gestionar tus preferencias de cookies en cualquier momento desde la configuración de tu navegador. Para más información, consulta nuestra <strong>Política de Cookies</strong>.</p>
      </>
    ),
  },
  {
    number: "12",
    title: "MODIFICACIONES DE ESTA POLÍTICA",
    content: (
      <>
        <p>SKALA se reserva el derecho de actualizar esta Política de Privacidad. Te notificaremos cualquier cambio relevante mediante un aviso en la plataforma o por correo electrónico. La fecha de la última actualización aparecerá siempre al pie de este documento.</p>
      </>
    ),
  },
  {
    number: "13",
    title: "CONTACTO Y RECLAMACIONES",
    content: (
      <>
        <p>Si tienes cualquier duda o consulta sobre esta política, contacta con nosotros en <strong>privacidad@skala.com</strong>.</p>
        <p>Si consideras que el tratamiento de tus datos no es conforme a la normativa, tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noreferrer">www.aepd.es</a>.</p>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <header className="privacy-header">
  
        <h2 className="privacy-title">Política de Privacidad de SKALA</h2>
      </header>

      <div className="privacy-grid">
        {sections.map((section) => (
          <div key={section.number} className="privacy-card">
            <h3 className="card-title">
              {section.number}. {section.title}
            </h3>
            <div className="card-body">{section.content}</div>
          </div>
        ))}
      </div>

      <footer className="privacy-footer">
        <p>Última actualización: abril de 2026</p>
      </footer>
    </div>
  );
}
