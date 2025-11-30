"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommand = void 0;
const logger_1 = __importDefault(require("./logger"));
const BLOCKED_COMMANDS = [
    'rm -rf /',
    'sudo rm',
    'dd',
    'mkfs',
    ':(){ :|:& };:', // Fork bomb
];
const CONFIRMATION_COMMANDS = [
    'rm',
    'git push --force',
    'npm uninstall',
    'yarn remove',
];
const validateCommand = (command) => {
    const trimmedCommand = command.trim();
    // Check for blocked commands
    for (const blocked of BLOCKED_COMMANDS) {
        if (trimmedCommand.includes(blocked)) {
            logger_1.default.warn(`Blocked dangerous command: ${trimmedCommand}`);
            return {
                allowed: false,
                requiresConfirmation: false,
                reason: 'Commande dangereuse bloquée par sécurité.',
            };
        }
    }
    // Check for confirmation commands
    for (const confirm of CONFIRMATION_COMMANDS) {
        if (trimmedCommand.startsWith(confirm)) {
            logger_1.default.info(`Command requires confirmation: ${trimmedCommand}`);
            return {
                allowed: true,
                requiresConfirmation: true,
                reason: 'Cette commande nécessite une confirmation.',
            };
        }
    }
    return { allowed: true, requiresConfirmation: false };
};
exports.validateCommand = validateCommand;
