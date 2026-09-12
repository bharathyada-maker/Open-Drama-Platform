# AI & Metadata Pipelines - OpenDrama

OpenDrama integrates Google Gemini to parse creator uploads, generate synopsis suggestions, detect content safety alerts, and generate transcript translation tracks.

## 1. Gemini Video Metadata Prompt

When a video is submitted, the title, description, and genre parameters are processed by Gemini. The prompt format instructs the model to return a structured JSON response:

```json
{
  "title": "A cinematic suggested title",
  "synopsis": "A 2-3 sentence synopsis representing the video vibe",
  "primary_genre": "Drama",
  "secondary_genres": ["Mystery", "Thriller"],
  "tags": ["neon", "nighttime", "mystery"],
  "topics": ["suspense", "urban life"],
  "scenes": [
    { "timestamp": "00:00", "description": "Opening context frame" }
  ],
  "safety_flags": {
    "adult_content": false,
    "violence": false,
    "hate_speech": false,
    "harassment": false
  },
  "thumbnail_desc": "Thumbnail suggest vector description",
  "keywords": ["tag1", "keyword"]
}
```

The system ensures that AI suggestions **do not overwrite** creator inputs unless they are explicitly reviewed and approved in the wizard fields.

## 2. Recommendation Engine (Hybrid Semantic Ranking)
Recommendations are calculated using a three-tier system:
1. **Semantic Similarity (pgvector):** Cosine distance calculation on the `videos.embedding` column matching search terms or user watch categories.
2. **User Preferences:** Overlapping user favorite genres and language codes.
3. **Momentum Scoring:** Applying decay scores based on the publication date (freshness boost).

## 3. Subtitles Localization Pipeline
- **AI Speech-To-Text:** Generates English transcripts automatically.
- **Translation:** Translates files into Hindi and Telugu.
- **Community Review:** Translates are queued for creator approval before status changes to 'approved'.
