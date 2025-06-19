import Link from "next/link"
import { useEffect, useState } from "react"
import { footerService } from "@/services/contentService"
import { FaFacebook, FaInstagramSquare, FaTiktok } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";

interface FooterData {
  id: number;
  nombre_tienda: string;
  branding: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  otras_redes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AboutUsData {
  id: number;
  descripcion: string;
  ubicacion_texto: string;
  ubicacion_maps: string;
  telefono: string;
  correo: string;
  created_at: string;
  updated_at: string;
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [footer, aboutUs] = await Promise.all([
          footerService.getFooter(),
          footerService.getAboutUs()
        ]);
        setFooterData(footer);
        setAboutUsData(aboutUs);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      }
    };

    fetchData();
  }, []);

  if (!footerData || !aboutUsData) {
    return <div>Cargando...</div>;
  }

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold">{footerData.nombre_tienda}</span>
            </div>
            <p className="text-gray-400">{footerData.branding}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Personalizacion</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/personalization/tshirt" className="hover:text-white">
                  Camisas
                </Link>
              </li>
              <li>
                <Link href="/personalization/cup" className="hover:text-white">
                  Gorras
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/personalization" className="hover:text-white">
                  PROXIMAMENTE
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>✉️ {aboutUsData.correo}</li>
              <li>📞 {aboutUsData.telefono}</li>
              <li>📍 {aboutUsData.ubicacion_texto}</li>
            </ul>
            {aboutUsData.ubicacion_maps && (
              <div className="mt-4">
                <iframe
                  src={aboutUsData.ubicacion_maps}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              {footerData.facebook && (
                <a href={footerData.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  <FaFacebook className="h-6 w-6 text-blue-600" />
                </a>
              )}
              {footerData.instagram && (
                <a href={footerData.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  <FaInstagramSquare className="h-6 w-6 text-pink-600" />
                </a>
              )}
              {footerData.tiktok && (
                <a href={footerData.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  <FaTiktok  className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {footerData.nombre_tienda}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
} 