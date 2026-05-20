import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Inicio',       to: '/'            },
  { label: 'Habitaciones', to: '/habitaciones' },
  { label: 'Reservar',     to: '/reservar'     },
  { label: 'Promociones',  to: '/promociones'  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a6e] flex items-center justify-center">
              <span className="text-[#f59e0b] font-bold text-sm">JL</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">Hostal Boutique</p>
              <p className="text-gray-400 text-xs">José Luis</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Tu hogar lejos de casa en el corazón de Miraflores, Lima.
            Confort, elegancia y atención personalizada.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
          <ul className="space-y-2">
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contacto</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gray-500" />
              Av. José Larco 1234, Miraflores<br />Lima, Perú
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-400">
              <Phone size={15} className="text-gray-500" />
              +51 1 234-5678
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-400">
              <Mail size={15} className="text-gray-500" />
              info@hostaljl.com
            </li>
          </ul>
        </div>

        {/* Social + image */}
        <div>
          <h3 className="text-white font-semibold mb-4">Síguenos</h3>
          <div className="flex gap-3 mb-5">
            {[
              { Icon: Facebook,  href: '#' },
              { Icon: Instagram, href: '#' },
              { Icon: Twitter,   href: '#' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-full bg-[#1e2d5a] hover:bg-[#1e3a6e] flex items-center justify-center transition-colors"
              >
                <Icon size={16} className="text-gray-300" />
              </a>
            ))}
          </div>
          <img
            src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80"
            alt="Hostal Boutique"
            className="rounded-xl w-full h-28 object-cover opacity-80"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1e2d5a]">
        <p className="text-center text-xs text-gray-500 py-4">
          © 2025 Hostal Boutique José Luis. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
