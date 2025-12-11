
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Force dynamic mode for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { url, generateClips = true, summaryType = 'none' } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`[API] Starting YouTube analysis for: ${url} (Clips: ${generateClips}, Summary: ${summaryType})`);

        // Paths
        const scriptPath = path.join(process.cwd(), 'scripts', 'youtube_agent.py');
        const outputDir = path.join(process.cwd(), 'public', 'temp', 'youtube', Date.now().toString());

        // Environment
        const env = {
            ...process.env,
            // Ensure Python can find locally installed packages if needed
            PYTHONPATH: process.env.PYTHONPATH || ''
        };

        return new Promise((resolve) => {
            const pythonProcess = spawn('python3.11', [
                scriptPath,
                '--action', 'analyze',
                '--url', url,
                '--output-dir', outputDir,
                '--api-key', process.env.OPENROUTER_API_KEY || '',
                '--generate-clips', String(generateClips),
                '--summary-type', summaryType
            ], { env });

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                const msg = data.toString();
                console.log(`[Python Script]: ${msg}`);
                errorData += msg;
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[API] Script exited with code ${code}`);
                    resolve(NextResponse.json({
                        status: 'error',
                        message: 'Processing failed',
                        details: errorData
                    }, { status: 500 }));
                } else {
                    try {
                        // Clean input: sometimes libraries print stuff despite our best efforts.
                        // We look for the last valid JSON object structure.
                        const jsonStart = outputData.indexOf('{');
                        const jsonEnd = outputData.lastIndexOf('}');

                        if (jsonStart === -1 || jsonEnd === -1) {
                            throw new Error("No JSON found in output");
                        }

                        const cleanJson = outputData.substring(jsonStart, jsonEnd + 1);
                        const result = JSON.parse(cleanJson);

                        // Make paths relative for the frontend
                        if (result.clips) {
                            result.clips = result.clips.map((clip: any) => {
                                // If clip has a file property, it's likely the old structure or fully generated
                                if (clip.file) {
                                    return {
                                        ...clip,
                                        file: clip.file.replace(path.join(process.cwd(), 'public'), '')
                                    };
                                } else {
                                    // New decoupled flow: clip IS the metadata
                                    return {
                                        file: '', // No pre-generated file
                                        metadata: clip
                                    };
                                }
                            });
                        }
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

    } catch (error) {
        console.error('[API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
