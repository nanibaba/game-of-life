import express, { json } from 'express';
import { Schema, connect } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(json());
app.use(cors());

const DB_NAME = "GameOfLifeDB";
const url = process.env.MONGODB_URI;

const statsSchema = new Schema({
  iterations: Number
}, { collection: 'Stats' });

const db = await connect(`${url}/${DB_NAME}?appName=GameOfLife`);
const Stats = db.model('Stats', statsSchema);

app.get('/', async (req, res) => {
    res.json({ healthy: true });
});

app.post('/stats', async (req, res) => {
  const stats = await Stats.create({
    iterations: req.body.iterations
  });
  res.status(201).json(stats);
});

app.listen(5000, () => console.log("Server running on port 5000"));
