import express from 'express';
import cors from 'cors';
import pool from './database/connection.js';
import habitacionRoutes from './routes/habitacion.routes.js';
import reservaRoutes    from './routes/reserva.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ message: 'API Hostal Boutique funcionando' }));

app.get('/test-db', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentDate');
    res.json({ ok: true, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/reservas',     reservaRoutes);

app.use((_req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada' }));

export default app;