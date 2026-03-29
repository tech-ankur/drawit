import express from 'express';
import userrouter from './router.js';
import cors from "cors";

const app = express();

// Allow your Vercel URL here once you have it
app.use(cors()); 
app.use(express.json());

// 1. Health check for Render and Cron-job.org
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/api", userrouter);

// 2. CRITICAL: Use process.env.PORT for Render
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`HTTP backend is running on port ${PORT}`);
});