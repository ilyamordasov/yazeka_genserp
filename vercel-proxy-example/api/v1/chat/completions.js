// Vercel API route to proxy OpenAI requests
export default async function handler(req, res) {
  // Set CORS headers to allow all origins and headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug: log request info
    console.log('Proxy received request:', {
      method: req.method,
      headers: req.headers,
      bodyKeys: Object.keys(req.body || {})
    });

    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Missing authorization header');
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    // Proxy the request to OpenAI
    console.log('Forwarding request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(req.body),
    });

    console.log('OpenAI response status:', response.status);

    // Handle streaming responses
    if (req.body?.stream) {
      console.log('Handling streaming response');
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const reader = response.body?.getReader();
      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } finally {
          reader.releaseLock();
        }
      }
      res.end();
    } else {
      // Handle regular JSON responses
      try {
        const responseText = await response.text();
        console.log('OpenAI raw response:', responseText);
        
        if (!responseText || responseText.trim() === '') {
          console.error('Empty response from OpenAI');
          return res.status(response.status).json({
            error: 'Empty response from OpenAI',
            status: response.status
          });
        }
        
        const data = JSON.parse(responseText);
        console.log('OpenAI parsed response data:', data);
        
        // Forward the exact status code and response from OpenAI
        res.status(response.status).json(data);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.error('Raw response text:', await response.text().catch(() => 'Unable to read response'));
        
        res.status(response.status).json({
          error: 'Invalid JSON response from OpenAI',
          details: parseError.message,
          status: response.status
        });
      }
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}