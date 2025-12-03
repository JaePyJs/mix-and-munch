# 🧑‍🍳 AI Recipe Extractor - Gemini Enhanced Version
# Uses YouTube Transcript API + Google Gemini for parsing
# Usage: python recipe_extractor_gemini.py "https://youtube.com/watch?v=VIDEO_ID"

import sys
import json
import re
import os
from typing import Optional, Dict, Any

# Load environment
def load_env():
    """Load API key from .env.local"""
    env_paths = ['.env.local', '.env', '../.env.local']
    for path in env_paths:
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
    return os.environ.get('GEMINI_API_KEY')


# ============================================================
# STEP 1: YouTube Transcript API 
# ============================================================

def get_transcript(video_id: str) -> Optional[str]:
    """Extract transcript using YouTube's caption API (v1.0+)"""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        
        ytt_api = YouTubeTranscriptApi()
        
        # Direct fetch
        try:
            transcript = ytt_api.fetch(video_id)
            snippets = transcript.snippets
            full_text = " ".join([s.text for s in snippets])
            log(f"Transcript extracted: {len(full_text)} chars, {len(snippets)} segments")
            return full_text
        except Exception as e:
            log(f"  Direct fetch failed: {e}")
        
        # Try listing available transcripts
        try:
            transcript_list = ytt_api.list(video_id)
            for t in transcript_list:
                try:
                    fetched = t.fetch()
                    snippets = fetched.snippets
                    full_text = " ".join([s.text for s in snippets])
                    log(f"Transcript ({t.language_code}): {len(full_text)} chars")
                    return full_text
                except:
                    continue
        except Exception as e:
            log(f"  List attempt failed: {e}")
            
        return None
    except ImportError:
        log("Install: pip install youtube-transcript-api")
        return None
    except Exception as e:
        log(f"Error: {e}")
        return None


# ============================================================
# STEP 2: Parse with Google Gemini (REST API)
# ============================================================

def parse_recipe_with_gemini(transcript: str, api_key: str) -> Optional[Dict[str, Any]]:
    """Use Google Gemini REST API to extract structured recipe"""
    import requests
    
    log("Parsing recipe with Gemini AI...")
    
    prompt = f"""You are a professional recipe extraction expert. Analyze this cooking video transcript and extract a complete, structured recipe.

TRANSCRIPT FROM YOUTUBE VIDEO:
{transcript}

Extract ALL details mentioned in the video and return ONLY valid JSON (no markdown, no explanation, no code blocks) in this exact format:

{{
  "title": "Full recipe name",
  "cuisine": "Filipino",
  "description": "Brief description of the dish",
  "ingredients": [
    {{"item": "ingredient name", "amount": "quantity", "notes": "optional prep notes"}},
    ...
  ],
  "instructions": [
    {{"step": 1, "action": "Detailed step description", "tip": "optional chef tip"}},
    ...
  ],
  "prep_time": "X minutes",
  "cook_time": "X minutes",
  "total_time": "X minutes",
  "servings": 4,
  "difficulty": "Easy/Medium/Hard",
  "chef_tips": ["tip 1", "tip 2"],
  "equipment": ["pot", "pan", etc],
  "tags": ["comfort food", "traditional", etc]
}}

Extract every ingredient and step mentioned. Be thorough and accurate. Return ONLY the JSON object."""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 4096
            }
        }
        
        response = requests.post(url, json=payload, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract text from response
            if 'candidates' in data and len(data['candidates']) > 0:
                content = data['candidates'][0].get('content', {})
                parts = content.get('parts', [])
                if parts:
                    response_text = parts[0].get('text', '')
                    
                    # Clean up response - remove markdown code blocks if present
                    response_text = response_text.strip()
                    if response_text.startswith('```'):
                        response_text = re.sub(r'^```json?\s*', '', response_text)
                        response_text = re.sub(r'\s*```$', '', response_text)
                    
                    # Parse JSON
                    recipe = json.loads(response_text)
                    log("Recipe parsed successfully with Gemini")
                    return recipe
        else:
            log(f"Gemini API error: {response.status_code}")
            log(f"   Response: {response.text[:500]}")
            
    except json.JSONDecodeError as e:
        log(f"JSON parsing failed: {e}")
    except Exception as e:
        log(f"Gemini error: {e}")
    
    return None


# ============================================================
# STEP 3: Video Info
# ============================================================

def get_video_info(video_id: str) -> Dict[str, str]:
    """Get video metadata"""
    try:
        import yt_dlp
        
        url = f"https://www.youtube.com/watch?v={video_id}"
        ydl_opts = {'quiet': True, 'no_warnings': True}
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                'title': info.get('title', ''),
                'description': info.get('description', ''),
                'channel': info.get('channel', ''),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', '')
            }
    except:
        return {}


def extract_video_id(url: str) -> Optional[str]:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/shorts\/([^&\n?#]+)',
        r'[?&]v=([^&\n?#]+)'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


# ============================================================
# MAIN
# ============================================================

# Global quiet mode flag for API calls
QUIET_MODE = False

def log(message: str):
    """Print message only if not in quiet mode"""
    if not QUIET_MODE:
        print(message, file=sys.stderr)

def extract_recipe(video_url: str) -> Dict[str, Any]:
    """Main extraction pipeline"""
    
    if not QUIET_MODE:
        log("\n" + "="*60)
        log("AI RECIPE EXTRACTOR - Gemini Enhanced")
        log("="*60 + "\n")
    
    # Load API key
    api_key = load_env()
    if not api_key:
        return {"success": False, "error": "GEMINI_API_KEY not found in .env.local"}
    
    # Extract video ID
    video_id = extract_video_id(video_url)
    if not video_id:
        return {"success": False, "error": "Invalid YouTube URL"}
    
    log(f"Video ID: {video_id}")
    
    # Get video info
    log("Fetching video info...")
    video_info = get_video_info(video_id)
    if video_info.get('title'):
        log(f"   Title: {video_info['title']}")
        log(f"   Channel: {video_info.get('channel', 'Unknown')}")
    
    # Get transcript
    log("Extracting transcript...")
    transcript = get_transcript(video_id)
    
    if not transcript:
        return {"success": False, "error": "No transcript available", "video_id": video_id}
    
    # Parse with Gemini
    log("Analyzing with AI...")
    recipe = parse_recipe_with_gemini(transcript, api_key)
    
    if not recipe:
        return {"success": False, "error": "Failed to parse recipe", "transcript_length": len(transcript)}
    
    # Add metadata
    recipe['video_id'] = video_id
    recipe['video_url'] = video_url
    recipe['video_title'] = video_info.get('title', '')
    recipe['channel'] = video_info.get('channel', '')
    recipe['thumbnail'] = video_info.get('thumbnail', '')
    recipe['transcript_length'] = len(transcript)
    
    return {"success": True, "recipe": recipe}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python recipe_extractor_gemini.py <youtube_url> [--quiet]"}))
        sys.exit(1)
    
    # Check for quiet mode flag (for API calls)
    if "--quiet" in sys.argv or "--json" in sys.argv:
        QUIET_MODE = True
        sys.argv = [arg for arg in sys.argv if arg not in ["--quiet", "--json"]]
    
    result = extract_recipe(sys.argv[1])
    
    # Always output valid JSON to stdout
    print(json.dumps(result, ensure_ascii=False))
    
    # Only save file and show decorative output in non-quiet mode
    if not QUIET_MODE and result.get('success'):
        recipe = result.get('recipe', {})
        print("\n" + "="*60, file=sys.stderr)
        print("EXTRACTED RECIPE", file=sys.stderr)
        print("="*60, file=sys.stderr)
        print(json.dumps(recipe, indent=2, ensure_ascii=False), file=sys.stderr)
        
        # Save
        video_id = recipe.get('video_id', 'unknown')
        output_file = f"recipe_{video_id}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(recipe, f, indent=2, ensure_ascii=False)
        print(f"\nSaved to: {output_file}", file=sys.stderr)
