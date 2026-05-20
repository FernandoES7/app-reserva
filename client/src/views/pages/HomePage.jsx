import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&q=80)' }}
      >
        <div className="absolute inset-0 bg-[#0f172a]/60" />
        <div className="relative text-center text-white px-6">
          <p className="text-[#f59e0b] font-medium tracking-widest text-sm mb-3 uppercase">
            Miraflores, Lima · Perú
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Tu hogar lejos<br />de casa
          </h1>
          <p className="text-gray-200 text-lg mb-8 max-w-xl mx-auto">
            Confort, elegancia y atención personalizada en el corazón de Miraflores.
          </p>
          <Link
            to="/reservar"
            className="inline-block bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg shadow-lg"
          >
            Reservar ahora
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🛏️', title: 'Habitaciones Premium',  desc: 'Desde suites con jacuzzi hasta cómodas habitaciones simples.' },
            { icon: '🏊', title: 'Piscina & Terraza',     desc: 'Relájate en nuestra piscina con vista a los jardines de Miraflores.' },
            { icon: '🍳', title: 'Desayuno Incluido',     desc: 'Buffet de desayuno peruano e internacional todos los días.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-bold text-[#1e3a6e] mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
