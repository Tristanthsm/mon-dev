
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
    try {
        const { sessionId, clipStart, clipEnd, subtitleStyle = 'none', outputFilename } = await req.json();

        if (!sessionId || clipStart === undefined || clipEnd === undefined) {
            return NextResponse.json({ error: 'Missing required parameters (sessionId, clipStart, clipEnd)' }, { status: 400 });
        }

        // Paths
        // Session ID is just the folder name in public/temp/youtube
        const outputDir = path.join(process.cwd(), 'public', 'temp', 'youtube', sessionId);
        const scriptPath = path.join(process.cwd(), 'scripts', 'youtube_agent.py');

        if (!fs.existsSync(outputDir)) {
            return NextResponse.json({ error: 'Session expired or not found' }, { status: 404 });
        }

        console.log(`[API] Rendering clip for session ${sessionId}: ${clipStart}-${clipEnd}, Style: ${subtitleStyle}`);

        // Environment
        const env = {
            ...process.env,
            PYTHONPATH: process.env.PYTHONPATH || ''
        };

        return new Promise((resolve) => {
            const pythonProcess = spawn('python3.11', [
                scriptPath,
                '--action', 'render',
                '--output-dir', outputDir,
                '--start', String(clipStart),
                '--end', String(clipEnd),
                '--subtitle-style', subtitleStyle,
                '--output-filename', outputFilename || `clip_${Date.now()}.mp4`
            ], { env });

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`[Python Log]: ${data.toString()}`);
                errorData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    resolve(NextResponse.json({
                        status: 'error',
                        message: 'Rendering failed',
                        details: errorData
                    }, { status: 500 }));
                } else {
                    try {
                        const jsonStart = outputData.indexOf('{');
                        const jsonEnd = outputData.lastIndexOf('}');

                        if (jsonStart === -1 || jsonEnd === -1) {
                            throw new Error("No JSON found in output");
                        }

                        const cleanJson = outputData.substring(jsonStart, jsonEnd + 1);
                        const result = JSON.parse(cleanJson);

                        resolve(NextResponse.json(result));
                    } catch (e) {
                        console.error('[API] Failed to parse JSON output', e);
                        resolve(NextResponse.json({
                            status: 'error',
                            message: 'Invalid JSON output from script',
                            rawOutput: outputData
                        }, { status: 500 }));
                    }
                }
            });
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
