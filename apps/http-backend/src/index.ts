import express, { request } from 'express';
import {JWT_SECRET} from '@repo/backend-common/config';
import { Request } from 'express';

const app = express();

export interface CustomRequest extends Request {
    userId?:string;
}
app.listen(3000, () => {
    console.log('HTTP backend is running on port 3000');
    console.log('JWT_SECRET:', JWT_SECRET);
});
