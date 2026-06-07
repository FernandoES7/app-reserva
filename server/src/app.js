import express from 'express';
import cors from 'cors';
import authRoutes          from './routes/Auth.js';
import habitacionRoutes from './routes/Habitacion.js';
import empleadoRoutes from './routes/Empleado.js';
import clienteRoutes from './routes/Cliente.js';
import reservaRoutes       from './routes/Reserva.js';
import statsRoutes         from './routes/Stats.js';
import hotelRoutes         from './routes/Hotel.js';

const app = express();

app.use(cors());
app.use(express.json());

// ── Rutas de la API ────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/reservas',     reservaRoutes);
app.use('/api/empleados',    empleadoRoutes);
app.use('/api/clientes',     clienteRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/hotel',        hotelRoutes);

// ── 404 ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada' }));

export default app;
