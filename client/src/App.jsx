import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './app/context/AuthContext';
import { BookingProvider } from './app/context/BookingContext';
import { Header } from './app/components/Header';
import { Footer } from './app/components/Footer';
import { AdminHeader } from './app/components/AdminHeader';
import { ProtectedRoute } from './app/components/ProtectedRoute';

import { Home } from './app/pages/Home';
import { Habitaciones } from './app/pages/Habitaciones';
import { Login } from './app/pages/Login';
import { Reservar } from './app/pages/Reservar';
import { MisReservas } from './app/pages/MisReservas';
import { Contacto } from './app/pages/Contacto';
import { NotFound } from './app/pages/NotFound';
import { AdminDashboard } from './app/pages/admin/AdminDashboard';
import { AdminHabitaciones } from './app/pages/admin/AdminHabitaciones';
import { AdminReservas } from './app/pages/admin/AdminReservas';
import { AdminUsuarios } from './app/pages/admin/AdminUsuarios';

function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 w-full box-border">
      <AdminHeader />
      <main className="flex-1 min-w-0 ml-64 p-8 min-h-screen box-border">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/habitaciones" element={<ProtectedRoute adminOnly><AdminLayout><AdminHabitaciones /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/reservas" element={<ProtectedRoute adminOnly><AdminLayout><AdminReservas /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute adminOnly><AdminLayout><AdminUsuarios /></AdminLayout></ProtectedRoute>} />

              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/habitaciones" element={<MainLayout><Habitaciones /></MainLayout>} />
              <Route path="/reservar" element={<MainLayout><Reservar /></MainLayout>} />
              <Route path="/contacto" element={<MainLayout><Contacto /></MainLayout>} />
              <Route path="/mis-reservas" element={<ProtectedRoute><MainLayout><MisReservas /></MainLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BookingProvider>
        </AuthProvider>
    </BrowserRouter>
  );
}