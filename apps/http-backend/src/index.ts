import express, { request } from 'express';
import userrouter from './router.js';
import cors from "cors" 
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api",userrouter);


app.listen(3001, () => {
    console.log('HTTP backend is running on port 3001');
});
