import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import corsMiddleware from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { setupTerminalWebSocket } from './websocket/terminal';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/terminal' });

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup WebSocket
setupTerminalWebSocket(wss);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`WebSocket server ready at ws://localhost:${PORT}/terminal`);
});
