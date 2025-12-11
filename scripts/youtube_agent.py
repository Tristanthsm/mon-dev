
import sys
import os
import argparse
import json

# CRITICAL: Redirect stdout to stderr immediately to prevent ANY library from polluting JSON output
original_stdout = sys.stdout
sys.stdout = sys.stderr

import warnings
warnings.filterwarnings("ignore")

import yt_dlp
import ffmpeg
import requests
import re
import stable_whisper as stable_ts
from datetime import datetime
import contextlib

# Import our new generator
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from subtitle_generator import create_karaoke_ass

# Configure logging to stderr
def log(message):
    sys.stderr.write(f"[Python] {message}\n")
    sys.stderr.flush()

def normalize_url(url):
    # Fix short URLs or mobile URLs
    if "youtu.be/" in url:
        video_id = url.split("youtu.be/")[1].split("?")[0]
        return f"https://www.youtube.com/watch?v={video_id}"
    return url

def download_video(url, output_dir):
    url = normalize_url(url)
    log(f"Downloading video from {url}...")
    
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': os.path.join(output_dir, 'video.%(ext)s'), # Fixed name for easier loading
        'quiet': True,
        'no_warnings': True,
        'http_headers': { 'User-Agent': user_agent },
        'nocheckcertificate': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            video_path = ydl.prepare_filename(info_dict)
            
            if not os.path.exists(video_path):
                 base, _ = os.path.splitext(video_path)
                 for ext in ['.mkv', '.mp4', '.webm']:
                     if os.path.exists(base + ext):
                         video_path = base + ext
                         break
            
        log(f"Video downloaded to: {video_path}")
        return video_path, info_dict.get('title', 'video')
    
    except Exception as e:
        log(f"Download error: {e}")
        raise ValueError("Impossible de télécharger la vidéo. Essayez avec l'URL longue ou une autre vidéo.")

def extract_audio(video_path, output_dir):
    log("Extracting audio...")
    audio_path = os.path.join(output_dir, "audio.mp3")
    try:
        (
            ffmpeg
            .input(video_path)
            .output(audio_path, acodec='mp3', loglevel='quiet')
            .overwrite_output()
            .run()
        )
    except ffmpeg.Error as e:
        log(f"Audio extraction failed: {e}")
        raise
    return audio_path

def transcribe_audio_stable(audio_path):
    log("Transcribing audio with Stable-Whisper (base model)...")
    model = stable_ts.load_model("base")
    result = model.transcribe(audio_path, word_timestamps=True, verbose=False)
    log("Transcription complete (with word alignment).")
    return result

def call_ai_api(prompt, api_key):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
        "X-Title": "Dev Cockpit YouTube Agent"
    }
    data = {
        "model": "deepseek/deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
    response.raise_for_status()
    return response.json()['choices'][0]['message']['content']

def analyze_transcript_for_clips(transcript_text, api_key):
    log("Analyzing transcript for viral clips using AI...")
    prompt = f"""
    You are an expert video editor and viral content strategist.
    Analyze the following transcript from a YouTube video and identify the 3 best moments to turn into viral short clips (TikTok/Shorts/Reels style).

    For each clip, provide:
    1. A catchy title/hook.
    2. Start time (seconds).
    3. End time (seconds).
    4. A brief reason why it's viral (e.g., emotional, punchline, insight).
    5. A 'virality_score' from 1-10.

    Transcript:
    {transcript_text[:15000]} 

    Return ONLY a valid JSON array of objects with keys: "title", "start", "end", "reason", "score".
    Do not add markdown formatting like ```json.
    """
    try:
        content = call_ai_api(prompt, api_key)
        content = content.replace("```json", "").replace("```", "").strip()
        clips_metadata = json.loads(content)
        return clips_metadata
    except Exception as e:
        log(f"AI Clip Analysis failed: {e}")
        return []

def generate_summary(transcript_text, api_key, summary_type):
    log(f"Generating {summary_type} summary...")
    length_instruction = "Give me a concise bullet-point summary (reading time < 1 min)." if summary_type == 'short' else "Give me a detailed, structured summary with sections, key takeaways, and deep insights (Markdown format)."
    prompt = f"""
    You are an expert content summarizer.
    {length_instruction}
    
    Transcript:
    {transcript_text[:20000]}
    """
    try:
        return call_ai_api(prompt, api_key)
    except Exception as e:
        log(f"Summary generation failed: {e}")
        return "Summary generation failed."

def generate_srt(segments):
    srt_content = ""
    for i, segment in enumerate(segments):
        start = format_timestamp(segment.start)
        end = format_timestamp(segment.end)
        text = segment.text.strip()
        srt_content += f"{i+1}\n{start} --> {end}\n{text}\n\n"
    return srt_content

def format_timestamp(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    milliseconds = int((seconds - int(seconds)) * 1000)
    return f"{hours:02}:{minutes:02}:{int(seconds):02},{milliseconds:03}"

def get_words_in_range(stable_result, start, end):
    words = []
    for seg in stable_result.segments:
        if seg.end < start: continue
        if seg.start > end: break
        for word in seg.words:
            if word.start >= start and word.end <= end:
                class WordObj:
                    def __init__(self, w, s, e):
                        self.word = w
                        self.start = s - start
                        self.end = e - start
                words.append(WordObj(word.word, word.start, word.end))
    return words

def generate_single_clip(video_path, output_path, start, end, stable_result, subtitle_style):
    log(f"Rendering clip [{start}-{end}] with style {subtitle_style}...")
    ass_path = output_path.replace('.mp4', '.ass')
    
    try:
        # 1. Generate Subtitles ASS if style requested
        has_subs = False
        if subtitle_style and subtitle_style != 'none':
            words = get_words_in_range(stable_result, start, end)
            if words:
                create_karaoke_ass(words, ass_path, subtitle_style)
                has_subs = True

        # 2. Cut & Burn
        stream = ffmpeg.input(video_path, ss=start, t=end-start)
        
        if has_subs:
            stream = stream.filter('ass', ass_path)
            stream = ffmpeg.output(stream, output_path, vcodec='libx264', acodec='aac', loglevel='quiet')
        else:
            stream = ffmpeg.output(stream, output_path, c='copy', loglevel='quiet')

        stream.overwrite_output().run()
        log(f"Clip rendered to: {output_path}")
        return output_path
        
    except Exception as e:
        log(f"Failed to render clip: {e}")
        raise

def main():
    parser = argparse.ArgumentParser()
    # Common args
    parser.add_argument("--action", required=True, choices=['analyze', 'render'])
    parser.add_argument("--output-dir", required=True)
    
    # Analyze args
    parser.add_argument("--url")
    parser.add_argument("--api-key")
    parser.add_argument("--generate-clips", type=str, default="true")
    parser.add_argument("--summary-type", type=str, default="none")
    
    # Render args
    parser.add_argument("--start", type=float)
    parser.add_argument("--end", type=float)
    parser.add_argument("--subtitle-style", type=str, default="none")
    parser.add_argument("--output-filename", type=str, default="clip.mp4")

    args = parser.parse_args()
    
    try:
        output_dir = args.output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        if args.action == 'analyze':
            # === ANALYZE MODE ===
            if not args.url or not args.api_key:
                raise ValueError("URL and API Key required for analysis.")

            # 1. Download & Extract
            video_path, video_title = download_video(args.url, output_dir)
            audio_path = extract_audio(video_path, output_dir)
            
            # 2. Transcribe
            stable_result = transcribe_audio_stable(audio_path)
            
            # 3. Save State (CRITICAL)
            # Save transcription with word timestamps
            # stable_ts result can be saved to JSON easily
            transcript_json_path = os.path.join(output_dir, "transcript.json")
            with open(transcript_json_path, 'w') as f:
                json.dump(stable_result.to_dict(), f) # stable-ts 2.x method
            
            log("State saved: transcript.json")

            # 4. Analyze Content
            full_text = stable_result.text
            clips = []
            summary = None
            
            if args.generate_clips.lower() == 'true':
                clips = analyze_transcript_for_clips(full_text, args.api_key)
            
            if args.summary_type in ['short', 'long']:
                summary = generate_summary(full_text, args.api_key, args.summary_type)
            
            srt_content = generate_srt(stable_result.segments)

            # Serialize segments for UI
            serializable_segments = []
            for s in stable_result.segments:
                serializable_segments.append({
                    "id": 0,
                    "start": s.start,
                    "end": s.end,
                    "text": s.text
                })

            result = {
                "status": "success",
                "session_id": os.path.basename(output_dir), # Folder name is session ID
                "video_title": video_title,
                "video_filename": os.path.basename(video_path),
                "transcription_excerpt": full_text[:500] + "...",
                "transcription_segments": serializable_segments,
                "srt_content": srt_content,
                "clips": clips,
                "summary": summary
            }
            
            sys.stdout = original_stdout
            print(json.dumps(result))

        elif args.action == 'render':
            # === RENDER MODE ===
            # Load state
            transcript_json_path = os.path.join(output_dir, "transcript.json")
            if not os.path.exists(transcript_json_path):
                raise ValueError("Session state not found (transcript.json missing).")
            
            # Load stable_ts result
            # We assume video file is 'video.mp4' or 'video.mkv' etc in the dir.
            # We search for it.
            video_path = None
            for ext in ['.mp4', '.mkv', '.webm']:
                 possible = os.path.join(output_dir, f'video{ext}')
                 if os.path.exists(possible):
                     video_path = possible
                     break
            
            if not video_path:
                 # Fallback: check all files
                 files = os.listdir(output_dir)
                 for f in files:
                     if f.startswith('video') and f.endswith(('.mp4', '.mkv', '.webm')):
                         video_path = os.path.join(output_dir, f)
                         break
            
            if not video_path:
                 raise ValueError("Video file not found in session.")

            with open(transcript_json_path, 'r') as f:
                data = json.load(f)
                # Reconstruct stable_ts object (simplified or just pass dict if helpers allow)
                # stable_ts does NOT have easy from_dict, but load_from_json works with file path.
                # Actually, our helper 'get_words_in_range' expects an object with .segments[].words[]
                # Let's mock it using the dict data.
                
                class MockSegment:
                    def __init__(self, s_dict):
                        self.start = s_dict['start']
                        self.end = s_dict['end']
                        self.words = [MockWord(w) for w in s_dict.get('words', [])]
                
                class MockWord:
                    def __init__(self, w_dict):
                        self.word = w_dict['word']
                        self.start = w_dict['start']
                        self.end = w_dict['end']

                class MockResult:
                    def __init__(self, data):
                        self.segments = [MockSegment(s) for s in data['segments']]

                stable_result = MockResult(data)

            output_file_path = os.path.join(output_dir, args.output_filename)
            
            generate_single_clip(
                video_path, 
                output_file_path, 
                args.start, 
                args.end, 
                stable_result, 
                args.subtitle_style
            )
            
            result = {
                 "status": "success",
                 "file_path": output_file_path,
                 "file_url": f"/temp/youtube/{os.path.basename(output_dir)}/{args.output_filename}"
            }
            
            sys.stdout = original_stdout
            print(json.dumps(result))

    except Exception as e:
        log(f"Critical error: {e}")
        sys.stdout = original_stdout
        print(json.dumps({
            "status": "error",
            "message": str(e),
            "details": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
