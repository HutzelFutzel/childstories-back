import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';


import dotenv from 'dotenv';
import { storiesRouter } from './router';
dotenv.config();

// environment variables
export let ENV_VARIABLES = process.env.NODE_ENV === 'development'
    ? JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.backend-variables-development.json'), 'utf8'))
    : JSON.parse(process.env.VARIABLES || '{}');

export let ENV_GCP_ADMIN = process.env.NODE_ENV === 'development'
    ? JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.gcp-admin-pkey-development.json'), 'utf8'))
    : JSON.parse(process.env.GCP_ADMIN || '{}');


// Secret Manager
const serviceAccount = ENV_GCP_ADMIN;

// server routes to check server status
// test it using curl <server>/server/ping
const serverRouter = express.Router();
serverRouter.get('/ping', (req: Request, res: Response) => {
    res.send(`
    <h1>Answer from server v1.01</h1>
    <p>Time: ${new Date().toISOString()}</p>`);
});

// Express
export const app = express();

const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: any) => {

        const allowedOrigins = process.env.NODE_ENV === 'development'
            ? [
                'http://localhost:3000',
                'http://localhost:8080',

            ] : process.env.NODE_ENV === 'production'
                    ? [
                        'https://childstories-back-342380485215.us-east4.run.app',
                        'https://childstories-back-by3mqtka3a-uk.a.run.app',
                        'https://childstories-web-342380485215.us-east4.run.app',
                        'https://childstories-web-by3mqtka3a-uk.a.run.app',
                    ]
                    : []

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked request from origin: ${origin}`);
            callback(new Error('Access denied. Invalid origin.'));
        }
    },
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
};

app.use(cors(corsOptions));

app.use(express.json());


app.use('/server', serverRouter);
app.use('/stories', storiesRouter);


export const userSocketMap = new Map();


async function main() {
    const PORT = 8080;

    try {
        // Create an HTTP server and attach the Express app
        const httpServer = http.createServer(app);

        // Start the HTTP server
        httpServer.listen(PORT, () => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`Childstories - Server started on http://localhost:${PORT}`);
            } else {
                console.log(`Childstories - Server started on ${ENV_VARIABLES.backendUrl}`);
            }
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });

    } catch (error: any) {
        console.error(error.message);
    }
}



if (require.main === module) {
    main(); // Only run main if this file is executed directly

}
