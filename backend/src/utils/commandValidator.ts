import logger from './logger';

interface ValidationResult {
    allowed: boolean;
    requiresConfirmation: boolean;
    reason?: string;
}

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

export const validateCommand = (command: string): ValidationResult => {
    const trimmedCommand = command.trim();

    // Check for blocked commands
    for (const blocked of BLOCKED_COMMANDS) {
        if (trimmedCommand.includes(blocked)) {
            logger.warn(`Blocked dangerous command: ${trimmedCommand}`);
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
            logger.info(`Command requires confirmation: ${trimmedCommand}`);
            return {
                allowed: true,
                requiresConfirmation: true,
                reason: 'Cette commande nécessite une confirmation.',
            };
        }
    }

    return { allowed: true, requiresConfirmation: false };
};
