import React from 'react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube  } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-10">
      {/* Sección de redes sociales */}
      <div className="bg-[#fab330] text-white py-4 xs:py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-sm xs:text-lg font-semibold mb-4 uppercase">¡Seguinos en nuestras redes!</h3>
          <div className="flex justify-center space-x-6 text-lg sx:text-2xl">
            <a
              href="https://www.facebook.com/LumtecEnergiaRenovable"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 xs:p-3 rounded text-[#4dae5b] hover:text-gray-200"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/lumtec.energiarenovable"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 xs:p-3 rounded text-[#4dae5b] hover:text-gray-200"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://wa.me/5492944701944"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 xs:p-3 rounded text-[#4dae5b] hover:text-gray-200"
              aria-label="Whatsapp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://www.youtube.com/@LumtecEnergiaRenovable"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 xs:p-3 rounded text-[#4dae5b] hover:text-gray-200"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      {/* Sección de derechos reservados */}
      <div className="bg-[#088c0c] text-white text-center p-2 xs:p-4">
        <p className="text-xs sx:text-sm">Lumtec Energía Renovable. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

