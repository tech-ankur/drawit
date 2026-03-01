import express, { request } from 'express';
import {JWT_SECRET} from '@repo/backend-common/config';
import userrouter from './router.js';
const app = express();
app.use(express.json());
app.use("/api",userrouter);


app.listen(3001, () => {
    console.log('HTTP backend is running on port 3001');
});
