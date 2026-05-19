import express from 'express';
import cors from 'cors';
import pool from './database/connection.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando'
  });
});

app.get('/test-db', async (req, res) => {
  try{
    const [rows] = await pool.query('SELECT NOW() AS currentDate');
    res.json({
      ok: true,
      data:rows
    });
  }catch(error){
    res.status(500).json({
      ok:false,
      error:error.message
    });
  }
});

export default app;