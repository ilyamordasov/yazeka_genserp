require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Yandex Images
app.get('/api/images', async (req, res) => {
  try {
    const { prompt } = req.query;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.YANDEX_SEARCH_API_KEY || process.env.YANDEX_SEARCH_API_KEY.includes('XXXX')) {
      console.log('🔍 SERVER: Yandex API key not properly configured, returning mock images');
      return res.json({ images: [
        'https://picsum.photos/400/300?random=1',
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3'
      ]});
    }
    
    console.log('🔍 SERVER: Making request to Yandex for prompt:', prompt);

    let query = JSON.stringify({
      "query": {
        "searchType": "SEARCH_TYPE_COM",
        "queryText": `${prompt} high quality`
      },
      "imageSpec": {
        "format": "IMAGE_FORMAT_PNG",
        "size": "IMAGE_SIZE_MEDIUM"
      },
      "folderId": process.env.YANDEX_FOLDER_ID,
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://searchapi.api.cloud.yandex.net/v2/image/search',
      headers: { 
        'Authorization': `API-Key ${process.env.YANDEX_SEARCH_API_KEY}`, 
        'Content-Type': 'application/json', 
      },
      data : query
    };

    const response = await axios.request(config)

    console.log('🔍 SERVER: Response status:', response.status);
    console.log('🔍 SERVER: Response data keys:', Object.keys(response.data || {}));

    console.log('🔍 SERVER: Response rawData received');
    const xmlData = atob(response.data.rawData);
    console.log('🔍 SERVER: Decoded XML data');
    
    // Function to decode HTML entities like &amp; to &
    const decodeHTMLEntities = (text) => {
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };

    // Function to check if image URL is accessible
    const checkImageAvailability = async (url) => {
      try {
        const response = await axios.head(url, {
          timeout: 3000, // 3 second timeout
          validateStatus: (status) => status < 500 // Accept redirects but not server errors
        });
        return response.status >= 200 && response.status < 400;
      } catch (error) {
        console.log(`🔍 SERVER: Image check failed for ${url}: ${error.message}`);
        return false;
      }
    };
    
    const imgs = new Set();
    const maxImages = 10;
    
    // Parse XML using regex to extract image URLs and dimensions
    const imagePropsRegex = /<image-properties>([\s\S]*?)<\/image-properties>/g;
    const candidateImages = [];
    
    let match;
    
    // Extract all image-properties blocks
    while ((match = imagePropsRegex.exec(xmlData)) !== null) {
      const imageProps = match[1];
      
      // Extract individual properties
      const imageLinkMatch = imageProps.match(/<image-link>(.*?)<\/image-link>/);
      const originalWidthMatch = imageProps.match(/<original-width>(\d+)<\/original-width>/);
      const originalHeightMatch = imageProps.match(/<original-height>(\d+)<\/original-height>/);
      
      if (imageLinkMatch) {
        const rawImageUrl = imageLinkMatch[1];
        const imageUrl = decodeHTMLEntities(rawImageUrl); // Decode HTML entities
        const width = originalWidthMatch ? parseInt(originalWidthMatch[1]) : 300;
        const height = originalHeightMatch ? parseInt(originalHeightMatch[1]) : 200;
        
        // Check if URL is valid and not webp, svg, or img
        const isValidImage = imageUrl && 
          !imageUrl.toLowerCase().includes('.webp') &&
          !imageUrl.toLowerCase().includes('.svg') &&
          !imageUrl.toLowerCase().includes('.img') &&
          !imageUrl.toLowerCase().includes('data:image');
          
        if (isValidImage) {
          candidateImages.push({
            url: imageUrl,
            width: width,
            height: height
          });
        } else {
          console.log(`🔍 SERVER: Skipping image (webp/svg/img/data):`, imageUrl);
        }
      }
    }

    // Check image availability and filter working images
    console.log(`🔍 SERVER: Checking availability of ${candidateImages.length} candidate images...`);
    const results = [];
    
    for (const candidate of candidateImages) {
      if (results.length >= maxImages) break;
      
      const isAvailable = await checkImageAvailability(candidate.url);
      if (isAvailable) {
        console.log(`🔍 SERVER: ✅ Image available ${candidate.width}x${candidate.height}:`, candidate.url);
        results.push(candidate);
      } else {
        console.log(`🔍 SERVER: ❌ Image not available:`, candidate.url);
      }
    }
    
    // If we don't have enough images, try regular URLs as fallback
    if (results.length < maxImages) {
      console.log(`🔍 SERVER: Need more images, checking fallback URLs...`);
      const urlRegex = /<url>(.*?)<\/url>/g;
      const fallbackCandidates = [];
      
      urlRegex.lastIndex = 0;
      
      while ((match = urlRegex.exec(xmlData)) !== null) {
        const rawImageUrl = match[1];
        const imageUrl = decodeHTMLEntities(rawImageUrl); // Decode HTML entities
        
        // Check if it's a valid image URL (be more inclusive)
        const isValidFallbackImage = imageUrl && 
          !imageUrl.toLowerCase().includes('.webp') &&
          !imageUrl.toLowerCase().includes('.svg') &&
          !imageUrl.toLowerCase().includes('.img') &&
          !imageUrl.toLowerCase().includes('data:image') &&
          !results.find(r => r.url === imageUrl) &&
          // Accept URLs with traditional extensions OR image hosting domains/paths
          (imageUrl.includes('.jpg') || 
           imageUrl.includes('.jpeg') || 
           imageUrl.includes('.png') || 
           imageUrl.includes('.gif') ||
           imageUrl.includes('images') ||
           imageUrl.includes('img') ||
           imageUrl.match(/\.(jpg|jpeg|png|gif)(\?|$)/i));
          
        if (isValidFallbackImage) {
          fallbackCandidates.push({
            url: imageUrl,
            width: 300,
            height: 200
          });
        }
      }
      
      // Check availability of fallback candidates
      for (const candidate of fallbackCandidates) {
        if (results.length >= maxImages) break;
        
        const isAvailable = await checkImageAvailability(candidate.url);
        if (isAvailable) {
          console.log(`🔍 SERVER: ✅ Fallback image available:`, candidate.url);
          results.push(candidate);
        } else {
          console.log(`🔍 SERVER: ❌ Fallback image not available:`, candidate.url);
        }
      }
    }
    
    // Convert results to old format for backward compatibility, but keep the rich data
    results.forEach(result => imgs.add(result.url));

    console.log('🔍 SERVER: Returning', results.length, 'images');
    
    res.json({ 
      images: results.map(r => r.url),
      imagesWithDimensions: results 
    });
    
  } catch (error) {
    console.error('🔍 SERVER ERROR:', error.message);
    console.error('🔍 SERVER ERROR Response:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`🚀 Use http://localhost:${PORT}/api/images?prompt=YOUR_PROMPT to test`);
});

