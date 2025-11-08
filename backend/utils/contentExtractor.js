const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

// Extract content from URL
const extractFromURL = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $('script, style, nav, footer, aside').remove();

    // Extract metadata
    const title = $('title').text().trim() ||
                  $('meta[property="og:title"]').attr('content') ||
                  $('h1').first().text().trim() ||
                  'Untitled';

    const description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') ||
                       '';

    const author = $('meta[name="author"]').attr('content') ||
                   $('meta[property="article:author"]').attr('content') ||
                   '';

    const publishedDate = $('meta[property="article:published_time"]').attr('content') ||
                          $('meta[name="date"]').attr('content') ||
                          '';

    const image = $('meta[property="og:image"]').attr('content') ||
                  $('img').first().attr('src') ||
                  '';

    // Extract main text content
    const mainContent = $('article, main, .content, .post-content, .entry-content')
      .text()
      .trim() || $('body').text().trim();

    // Clean up whitespace
    const cleanedContent = mainContent
      .replace(/\s+/g, ' ')
      .substring(0, 5000);

    return {
      title,
      content: cleanedContent,
      metadata: {
        author,
        date: publishedDate ? new Date(publishedDate) : null,
        source: new URL(url).hostname,
        platform: detectPlatform(url),
        extractedText: description
      },
      thumbnail: image.startsWith('http') ? image : null
    };
  } catch (error) {
    console.error('URL extraction error:', error.message);
    return {
      title: url,
      content: '',
      metadata: {
        source: url,
        extractedText: 'Failed to extract content from URL'
      },
      thumbnail: null
    };
  }
};

// Detect platform from URL
const detectPlatform = (url) => {
  const platforms = {
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'twitter.com': 'Twitter',
    'x.com': 'Twitter',
    'instagram.com': 'Instagram',
    'facebook.com': 'Facebook',
    'linkedin.com': 'LinkedIn',
    'medium.com': 'Medium',
    'github.com': 'GitHub',
    'stackoverflow.com': 'StackOverflow',
    'reddit.com': 'Reddit'
  };

  for (const [domain, platform] of Object.entries(platforms)) {
    if (url.includes(domain)) {
      return platform;
    }
  }

  return 'Web';
};

// Extract text from PDF
const extractFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);

    return {
      extractedText: pdfData.text.substring(0, 10000),
      pages: pdfData.numpages,
      metadata: pdfData.metadata
    };
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    return {
      extractedText: 'Failed to extract text from PDF',
      pages: 0,
      metadata: {}
    };
  }
};

// Generate thumbnail for image (using sharp would go here)
const generateThumbnail = async (imagePath) => {
  try {
    // For now, just return the original path
    // In production, you'd use sharp to create a thumbnail
    return imagePath;
  } catch (error) {
    console.error('Thumbnail generation error:', error.message);
    return imagePath;
  }
};

// Detect content type from URL or file
const detectContentType = (url) => {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'video';
  }
  if (urlLower.includes('instagram.com/reel') || urlLower.includes('tiktok.com')) {
    return 'reel';
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'tweet';
  }
  if (urlLower.includes('amazon.com') || urlLower.includes('ebay.com')) {
    return 'product';
  }
  if (urlLower.includes('github.com')) {
    return 'code';
  }
  if (urlLower.match(/\.(pdf)$/)) {
    return 'pdf';
  }
  if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return 'image';
  }

  return 'article';
};

module.exports = {
  extractFromURL,
  extractFromPDF,
  generateThumbnail,
  detectContentType,
  detectPlatform
};
