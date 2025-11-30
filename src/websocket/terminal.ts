import { WebSocket, WebSocketServer } from 'ws';
import * as pty from 'node-pty';
import os from 'os';
import logger from '../utils/logger';
import { validateCommand } from '../utils/commandValidator';

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh';

export const setupTerminalWebSocket = (wss: WebSocketServer) => {
    wss.on('connection', (ws: WebSocket) => {
        logger.info('New terminal connection established');

        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env as Record<string, string>,
        });

        // Send PTY output to frontend
        ptyProcess.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
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
                const validation = validateCommand(command);
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
            logger.info('Terminal connection closed');
            ptyProcess.kill();
        });

        ws.on('error', (err) => {
            logger.error('WebSocket error:', err);
            ptyProcess.kill();
        });
    });
};
