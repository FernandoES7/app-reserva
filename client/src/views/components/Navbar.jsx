import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Inicio',        to: '/'            },
  { label: 'Habitaciones',  to: '/habitaciones' },
  { label: 'Reservar',      to: '/reservar'     },
  { label: 'Promociones',   to: '/promociones'  },
  { label: 'Contacto',      to: '/contacto'     },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e3a6e] flex items-center justify-center">
            <span className="text-[#f59e0b] font-bold text-sm tracking-wide">JL</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-[#1e3a6e] text-sm">Hostal Boutique</p>
            <p className="text-gray-400 text-xs">José Luis</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors relative pb-0.5 ${
                  active
                    ? 'text-[#f59e0b] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#f59e0b]'
                    : 'text-gray-600 hover:text-[#1e3a6e]'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          to="/login"
          className="bg-[#1e3a6e] hover:bg-[#162d56] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
}
