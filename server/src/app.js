import express from 'express';
import cors from 'cors';
import pool from './database/connection.js';
import habitacionRoutes from './routes/Habitacion.js';
import reservaRoutes    from './routes/Reserva.js';
import authRoutes       from './routes/Auth.js';        // ← nuevo

const app = express();

app.use(cors());
app.use(express.json());

// ── Health checks ──────────────────────────────────────
app.get('/', (_req, res) => res.json({ message: 'API Hostal Boutique funcionando' }));

app.get('/test-db', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentDate');
    res.json({ ok: true, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ── Rutas de la API ────────────────────────────────────
app.use('/api/auth',         authRoutes);           // ← nuevo
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/reservas',     reservaRoutes);

// ── 404 ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada' }));

export default app;
