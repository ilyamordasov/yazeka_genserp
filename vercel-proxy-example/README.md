# OpenAI Vercel Proxy

This is a Vercel proxy to access OpenAI API from regions where it's restricted.

## Setup

1. Clone this directory to a new repository
2. Deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel --prod
   ```
3. Update your main app's `.env` file:
   ```
   REACT_APP_OPENAI_BASE_URL="https://your-vercel-proxy.vercel.app/api/v1"
   ```

## How it works

- Receives OpenAI API requests from your app
- Proxies them to the official OpenAI API
- Returns the responses back to your app
- Handles both streaming and regular responses
- Includes proper CORS headers

## Security

- The proxy only forwards requests to OpenAI
- Your API key is still sent directly to OpenAI (through the proxy)
- No API keys are stored on the proxy server