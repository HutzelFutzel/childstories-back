"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSocketMap = exports.app = exports.ENV_GCP_ADMIN = exports.ENV_VARIABLES = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const router_1 = require("./router");
dotenv_1.default.config();
// environment variables
exports.ENV_VARIABLES = process.env.NODE_ENV === 'development'
    ? JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../.backend-variables-development.json'), 'utf8'))
    : JSON.parse(process.env.VARIABLES || '{}');
exports.ENV_GCP_ADMIN = process.env.NODE_ENV === 'development'
    ? JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../.gcp-admin-pkey-development.json'), 'utf8'))
    : JSON.parse(process.env.GCP_ADMIN || '{}');
// Secret Manager
const serviceAccount = exports.ENV_GCP_ADMIN;
// server routes to check server status
// test it using curl <server>/server/ping
const serverRouter = express_1.default.Router();
serverRouter.get('/ping', (req, res) => {
    res.send(`
    <h1>Answer from server v1.01</h1>
    <p>Time: ${new Date().toISOString()}</p>`);
});
// Express
exports.app = (0, express_1.default)();
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.NODE_ENV === 'development'
            ? [
                'http://localhost:3000',
                'http://localhost:8080',
            ] : process.env.NODE_ENV === 'production'
            ? [
                'https://childstories-web-342380485215.us-east4.run.app',
                'https://childstories-web-by3mqtka3a-uk.a.run.app',
            ]
            : [];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`Blocked request from origin: ${origin}`);
            callback(new Error('Access denied. Invalid origin.'));
        }
    },
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
};
exports.app.use((0, cors_1.default)(corsOptions));
// Apply JSON body parser for other routes
// app.use((req, res, next) => {
//     if (req.originalUrl === stripeWebhookUrl) {
//         next();
//     } else {
//         express.json()(req, res, next);
//     }
// });
exports.app.use(express_1.default.json());
exports.app.use('/server', serverRouter);
exports.app.use('/stories', router_1.storiesRouter);
exports.userSocketMap = new Map();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const PORT = process.env.PORT || 8080;
        try {
            // Create an HTTP server and attach the Express app
            const httpServer = http_1.default.createServer(exports.app);
            // Start the HTTP server
            httpServer.listen(PORT, () => {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Server started on http://localhost:${PORT}`);
                }
                else {
                    console.log(`Server started on ${exports.ENV_VARIABLES.backendUrl}`);
                }
                console.log(`Environment: ${process.env.NODE_ENV}`);
            });
        }
        catch (error) {
            console.error(error.message);
        }
    });
}
if (require.main === module) {
    main(); // Only run main if this file is executed directly
}
