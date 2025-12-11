
import datetime

def seconds_to_ass_time(seconds):
    """Converts seconds to H:MM:SS.cs format for ASS."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    cs = int((seconds - int(seconds)) * 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

def generate_ass_header(style_name="Karaoke"):
    """
    Generates the ASS header with predefined styles.
    """
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
"""
    
    # Define styles
    # PrimaryColour: &H00BBGGRR (BGR hex)
    # &H00FFFFFF = White
    # &H0000FF00 = Green (BGR: 00 FF 00) -> Actually Green is 00FF00
    # Let's define specific karaoke styles
    
    # Karaoke Style (White text, Green highlight)
    # Use SecondaryColour (Karaoke fill color)
    # Keep Outline thick black
    
    styles = {
        "Karaoke_Green": "Style: Karaoke_Green,Arial,60,&H00FFFFFF,&H0000FF00,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,0,2,10,10,60,1", 
        "Karaoke_Yellow": "Style: Karaoke_Yellow,Arial,60,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,0,2,10,10,60,1", 
        "Clean": "Style: Clean,Arial,50,&H00FFFFFF,&H00000000,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,10,10,60,1"
    }

    header += styles.get(style_name, styles["Karaoke_Green"]) + "\n"
    
    header += """
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    return header

def create_karaoke_ass(segments, output_file, style_name="Karaoke_Green"):
    """
    Generates an ASS file with karaoke effects from word-level segments.
    segments: list of word objects {word: str, start: float, end: float, probability: float} (from stable-ts)
    """
    
    # Pre-process into lines for landscape video
    lines = []
    current_line = []
    current_chars = 0
    max_chars_per_line = 60 # Increased for Landscape
    
    for word_obj in segments:
        word = word_obj.word.strip()
        if not word: continue
        
        if current_chars + len(word) > max_chars_per_line and current_line:
            lines.append(current_line)
            current_line = []
            current_chars = 0
        
        current_line.append(word_obj)
        current_chars += len(word) + 1
    
    if current_line:
        lines.append(current_line)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(generate_ass_header(style_name))
        
        for line in lines:
            if not line: continue
            
            start_time = seconds_to_ass_time(line[0].start)
            end_time = seconds_to_ass_time(line[-1].end)
            
            # Karaoke line construction
            # {\k10}Durations in centiseconds
            text_content = ""
            
            for i, w in enumerate(line):
                # Calculate duration in cs
                duration = int((w.end - w.start) * 100)
                # Ensure word has space if not last (though strict karaoke handles concatenation)
                # Add space after word if needed
                word_text = w.word.strip()
                if i < len(line) - 1:
                     word_text += " "
                     
                if "Karaoke" in style_name:
                    text_content += f"{{\\k{duration}}}{word_text}"
                else:
                    text_content += word_text
            
            # Write Event
            # Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
            f.write(f"Dialogue: 0,{start_time},{end_time},{style_name},,0,0,0,,{{\\an5}}{text_content}\n")

import json

# Integration
if __name__ == "__main__":
    # Test
    pass
