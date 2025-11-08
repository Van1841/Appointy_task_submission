const Anthropic = require('@anthropic-ai/sdk');

// Initialize Claude AI client
const initClaudeClient = () => {
  if (!process.env.CLAUDE_API_KEY) {
    // Warning message will be shown in server.js
    return null;
  }

  // Validate API key format (keys should start with sk-)
  if (!process.env.CLAUDE_API_KEY.startsWith('sk-')) {
    // Warning message will be shown in server.js
    return null;
  }

  try {
    return new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });
  } catch (error) {
    console.error('❌ Failed to initialize Claude client:', error.message);
    return null;
  }
};

const claudeClient = initClaudeClient();

// Analyze content and categorize it
const analyzeContent = async (content, type) => {
  if (!claudeClient) {
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

Respond in JSON format:
{
  "category": "...",
  "sentiment": "...",
  "keywords": ["...", "..."],
  "relatedTopics": ["...", "..."],
  "summary": "..."
}`;

    const message = await claudeClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      category: 'other',
      sentiment: 'neutral',
      keywords: [],
      relatedTopics: [],
      summary: responseText.substring(0, 200)
    };
  } catch (error) {
    if (error.status === 401 || error.message?.includes('authentication')) {
      console.error('❌ Claude API authentication failed. Please check your API key.');
    } else {
      console.error('Claude AI analysis error:', error.message);
    }
    return {
      category: 'other',
      sentiment: 'neutral',
      keywords: [],
      relatedTopics: [],
      summary: 'AI analysis unavailable'
    };
  }
};

// Semantic search using Claude
const semanticSearch = async (query, uploads) => {
  if (!claudeClient || uploads.length === 0) {
    return uploads;
  }

  try {
    const uploadsText = uploads.map((u, idx) =>
      `${idx}. ${u.title || ''} - ${u.content || ''} - ${u.metadata?.extractedText || ''}`
    ).join('\n\n');

    const prompt = `Given this search query: "${query}"

Find the most relevant items from this list and return their indices (0-based) in order of relevance:

${uploadsText.substring(0, 8000)}

Return only a JSON array of indices, e.g., [2, 5, 0, 8, 1]`;

    const message = await claudeClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);

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
  if (!claudeClient || uploads.length === 0) {
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

Respond in JSON format:
{
  "summary": "...",
  "patterns": ["...", "..."],
  "recommendations": ["...", "..."],
  "growthAreas": ["...", "..."]
}`;

    const message = await claudeClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      summary: responseText,
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
  if (!claudeClient || existingUploads.length === 0) {
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
Respond in JSON format:
{
  "isDuplicate": true/false,
  "duplicateIndex": number or null,
  "similarity": 0.0 to 1.0
}`;

    const message = await claudeClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isDuplicate: result.isDuplicate,
        duplicateOf: result.duplicateIndex !== null ? existingUploads[result.duplicateIndex]?._id : null,
        similarity: result.similarity
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
  if (!claudeClient || uploads.length < 2) {
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

    const message = await claudeClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);

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
