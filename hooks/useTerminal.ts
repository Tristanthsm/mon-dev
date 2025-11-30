import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

export const useTerminal = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(null);
    const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Init xterm
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1a1b26', // Tokyo Night background
                foreground: '#a9b1d6',
                cursor: '#f7768e',
                selectionBackground: '#33467C',
                black: '#32344a',
                red: '#f7768e',
                green: '#9ece6a',
                yellow: '#e0af68',
                blue: '#7aa2f7',
                magenta: '#ad8ee6',
                cyan: '#449dab',
                white: '#787c99',
                brightBlack: '#444b6a',
                brightRed: '#ff7a93',
                brightGreen: '#b9f27c',
                brightYellow: '#ff9e64',
                brightBlue: '#7da6ff',
                brightMagenta: '#bb9af7',
                brightCyan: '#0db9d7',
                brightWhite: '#acb0d0',
            },
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        // Connect to WebSocket
        const ws = new WebSocket('ws://localhost:3001/terminal');

        ws.onopen = () => {
            term.write('\r\n\x1b[32mConnected to backend terminal\x1b[0m\r\n');
        };

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onclose = () => {
            term.write('\r\n\x1b[31mConnection closed\x1b[0m\r\n');
        };

        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        // Handle resize
        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        setTerminalInstance(term);
        setWsInstance(ws);

        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
            ws.close();
        };
    }, []);

    return { terminalRef, terminalInstance, wsInstance };
};
