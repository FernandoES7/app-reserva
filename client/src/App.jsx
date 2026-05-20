import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar       from './views/components/Navbar.jsx';
import Footer       from './views/components/Footer.jsx';
import HomePage     from './views/pages/HomePage.jsx';
import ReservarPage from './views/pages/ReservarPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/reservar" element={<ReservarPage />} />
            {/* Agrega aquí más rutas: /habitaciones, /promociones, /contacto */}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
