const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI client
const initGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY not set. AI features will be disabled.');
    return null;
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const genAI = initGeminiClient();
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

// Analyze content and categorize it
const analyzeContent = async (content, type) => {
  if (!model) {
    return {
      category: 'other',
      sentiment: 'neutral',
      keywords: [],
      relatedTopics: [],
      summary: 'AI analysis unavailable'
    };
  }

  try {
    const prompt = `Analyze the following ${type} content and provide:
1. Category (choose from: product, quote, book, todo, article, video, reel, tweet, code, research, other)
2. Sentiment (positive, negative, neutral)
3. Top 5 keywords
4. Related topics (3-5 topics)
5. Brief summary (2-3 sentences)

Content: ${content.substring(0, 2000)}

Respond ONLY with valid JSON in this exact format:
{
  "category": "...",
  "sentiment": "...",
  "keywords": ["...", "..."],
  "relatedTopics": ["...", "..."],
  "summary": "..."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      category: 'other',
      sentiment: 'neutral',
      keywords: [],
      relatedTopics: [],
      summary: text.substring(0, 200)
    };
  } catch (error) {
    console.error('Gemini AI analysis error:', error.message);
    return {
      category: 'other',
      sentiment: 'neutral',
      keywords: [],
      relatedTopics: [],
      summary: 'AI analysis failed'
    };
  }
};

// Semantic search using Gemini
const semanticSearch = async (query, uploads) => {
  if (!model || uploads.length === 0) {
    return uploads;
  }

  try {
    const uploadsText = uploads.map((u, idx) =>
      `${idx}. ${u.title || ''} - ${u.content || ''} - ${u.metadata?.extractedText || ''}`
    ).join('\n\n');

    const prompt = `Given this search query: "${query}"

Find the most relevant items from this list and return their indices (0-based) in order of relevance:

${uploadsText.substring(0, 8000)}

Return ONLY a JSON array of indices, e.g., [2, 5, 0, 8, 1]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*?\]/);

    if (jsonMatch) {
      const indices = JSON.parse(jsonMatch[0]);
      return indices.map(idx => uploads[idx]).filter(Boolean);
    }

    return uploads;
  } catch (error) {
    console.error('Semantic search error:', error.message);
    return uploads;
  }
};

// Generate weekly reflection summary
const generateWeeklySummary = async (uploads, weekStart, weekEnd) => {
  if (!model || uploads.length === 0) {
    return {
      summary: 'No uploads this week',
      patterns: [],
      recommendations: [],
      growthAreas: []
    };
  }

  try {
    const uploadsText = uploads.map(u =>
      `- ${u.title || u.category}: ${u.content?.substring(0, 200) || ''}`
    ).join('\n');

    const prompt = `Analyze this week's saved content (${weekStart.toDateString()} to ${weekEnd.toDateString()}):

${uploadsText.substring(0, 5000)}

Provide:
1. A brief summary of the week
2. Patterns you notice
3. Recommendations for the user
4. Growth areas

Respond ONLY with valid JSON in this format:
{
  "summary": "...",
  "patterns": ["...", "..."],
  "recommendations": ["...", "..."],
  "growthAreas": ["...", "..."]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      summary: text,
      patterns: [],
      recommendations: [],
      growthAreas: []
    };
  } catch (error) {
    console.error('Weekly summary generation error:', error.message);
    return {
      summary: 'Unable to generate summary',
      patterns: [],
      recommendations: [],
      growthAreas: []
    };
  }
};

// Detect duplicate or similar content
const detectDuplicate = async (newContent, existingUploads) => {
  if (!model || existingUploads.length === 0) {
    return { isDuplicate: false, duplicateOf: null, similarity: 0 };
  }

  try {
    const existingTexts = existingUploads.slice(0, 20).map((u, idx) =>
      `${idx}. ${u.title || ''} - ${u.content?.substring(0, 300) || ''}`
    ).join('\n\n');

    const prompt = `Compare this new content with existing items:

NEW CONTENT: ${newContent.substring(0, 500)}

EXISTING ITEMS:
${existingTexts}

Is the new content a duplicate or very similar to any existing item?
Respond ONLY with valid JSON in this format:
{
  "isDuplicate": true or false,
  "duplicateIndex": number or null,
  "similarity": 0.0 to 1.0
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*?\}/);

    if (jsonMatch) {
      const resultData = JSON.parse(jsonMatch[0]);
      return {
        isDuplicate: resultData.isDuplicate,
        duplicateOf: resultData.duplicateIndex !== null ? existingUploads[resultData.duplicateIndex]?._id : null,
        similarity: resultData.similarity
      };
    }

    return { isDuplicate: false, duplicateOf: null, similarity: 0 };
  } catch (error) {
    console.error('Duplicate detection error:', error.message);
    return { isDuplicate: false, duplicateOf: null, similarity: 0 };
  }
};

// Find similar uploads for thread creation
const findSimilarUploads = async (uploads) => {
  if (!model || uploads.length < 2) {
    return [];
  }

  try {
    const uploadsText = uploads.map((u, idx) =>
      `${idx}. ${u.title || u.category}: ${u.content?.substring(0, 200) || ''}`
    ).join('\n\n');

    const prompt = `Analyze these saved items and group similar ones together for automatic thread creation:

${uploadsText.substring(0, 6000)}

Return groups of similar items as JSON array:
[
  {
    "title": "Thread name",
    "indices": [0, 3, 7],
    "similarity": 0.8
  }
]

Only include groups with 2+ items and similarity > 0.7`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*?\]/);

    if (jsonMatch) {
      const groups = JSON.parse(jsonMatch[0]);
      return groups.map(group => ({
        title: group.title,
        uploads: group.indices.map(idx => uploads[idx]?._id).filter(Boolean),
        similarity: group.similarity
      }));
    }

    return [];
  } catch (error) {
    console.error('Similar uploads detection error:', error.message);
    return [];
  }
};

module.exports = {
  analyzeContent,
  semanticSearch,
  generateWeeklySummary,
  detectDuplicate,
  findSimilarUploads
};
