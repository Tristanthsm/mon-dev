"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("./middleware/cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const terminal_1 = require("./websocket/terminal");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server, path: '/terminal' });
// Middleware
app.use(cors_1.default);
app.use(express_1.default.json());
// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Setup WebSocket
(0, terminal_1.setupTerminalWebSocket)(wss);
// Error handling
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
    logger_1.default.info(`WebSocket server ready at ws://localhost:${PORT}/terminal`);
});
