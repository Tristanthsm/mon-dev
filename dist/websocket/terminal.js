"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTerminalWebSocket = void 0;
const ws_1 = require("ws");
const pty = __importStar(require("node-pty"));
const os_1 = __importDefault(require("os"));
const logger_1 = __importDefault(require("../utils/logger"));
const commandValidator_1 = require("../utils/commandValidator");
const shell = os_1.default.platform() === 'win32' ? 'powershell.exe' : 'zsh';
const setupTerminalWebSocket = (wss) => {
    wss.on('connection', (ws) => {
        logger_1.default.info('New terminal connection established');
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env,
        });
        // Send PTY output to frontend
        ptyProcess.onData((data) => {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(data);
            }
        });
        // Receive input from frontend
        ws.on('message', (message) => {
            const command = message.toString();
            // Simple check for dangerous commands before sending to PTY
            // Note: This is a basic check. For full security, we'd need to parse the shell stream which is complex.
            // Here we check if the input *looks* like a dangerous command being typed.
            // In a real PTY, we are sending keystrokes, so "rm -rf" comes as 'r', 'm', ' ', ...
            // So validation here is tricky. 
            // For this MVP, we will log the input and rely on the user being the owner.
            // The validator we built is better suited for an API-based execution, but for a PTY, 
            // we pass through keystrokes.
            // However, if we receive a large chunk (paste), we can validate it.
            if (command.length > 1) {
                const validation = (0, commandValidator_1.validateCommand)(command);
                if (!validation.allowed) {
                    ws.send(`\r\n\x1b[31m${validation.reason}\x1b[0m\r\n`);
                    return;
                }
            }
            ptyProcess.write(command);
        });
        // Handle resize
        // We expect a specific JSON format for resize events if we want to support it,
        // but standard xterm.js sends raw strings usually. 
        // We'll implement a custom message protocol later if needed. 
        // For now, we assume raw text is input.
        ws.on('close', () => {
            logger_1.default.info('Terminal connection closed');
            ptyProcess.kill();
        });
        ws.on('error', (err) => {
            logger_1.default.error('WebSocket error:', err);
            ptyProcess.kill();
        });
    });
};
exports.setupTerminalWebSocket = setupTerminalWebSocket;
