import OpenAI from "openai";
import axios from "axios";
import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";

const baseURL = process.env.REACT_APP_OPENAI_BASE_URL || 'https://api.openai.com/v1';
console.log('🔍 DEBUG: OpenAI baseURL:', baseURL);
console.log('🔍 DEBUG: Environment variables:', {
    REACT_APP_OPENAI_BASE_URL: process.env.REACT_APP_OPENAI_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
});

const client = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    baseURL: baseURL,
    dangerouslyAllowBrowser: true,
    maxRetries: 0, // Disable automatic retries to prevent rapid successive requests
});

// Request throttling to prevent rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

async function throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`🔍 DEBUG: Throttling request, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
}

// Retry logic with exponential backoff for rate limit errors
async function retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            console.log(`🔍 DEBUG: Attempt ${attempt} failed:`, error.message);
            
            // Check if it's a rate limit error
            if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('429')) {
                if (attempt === maxRetries) {
                    console.log('🔍 DEBUG: Max retries reached, giving up');
                    throw error;
                }
                
                // Exponential backoff: 2^attempt seconds + random jitter
                const baseDelay = Math.pow(2, attempt) * 1000;
                const jitter = Math.random() * 1000;
                const delay = baseDelay + jitter;
                
                console.log(`🔍 DEBUG: Rate limited, waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // For non-rate-limit errors, don't retry
                throw error;
            }
        }
    }
}

export async function getOpenAIResponse(messages, onStreamUpdate = null) {
    return await retryWithBackoff(async () => {
        // Apply request throttling
        await throttleRequest();
        
        console.log('🔍 DEBUG: Making OpenAI request with throttling...');
        
        // Add system prompt for detailed responses
        const systemPrompt = {
            role: "system",
            content: SYSTEM_PROMPT
        };

        const messagesWithSystem = [systemPrompt, ...messages];

        if (onStreamUpdate) {
            // Streaming mode with optimized parameters
            const stream = await client.chat.completions.create({
                model: "gpt-3.5-turbo", // Use gpt-3.5-turbo for better rate limits
                messages: messagesWithSystem,
                max_tokens: 500, // Reduced token count to save on rate limits
                temperature: 0.7,
                response_format: { type: "json_object" },
                stream: true,
            });

            let fullContent = '';
            console.log('🔍 DEBUG: Starting streaming...');
            
            try {
                for await (const chunk of stream) {
                    console.log('🔍 DEBUG: Received chunk:', chunk);
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        fullContent += content;
                        console.log('🔍 DEBUG: Current fullContent length:', fullContent.length);
                        
                        // Try to extract chatResponse, imagePrompt, and youtubeVideo from partial JSON during streaming
                        let displayText = fullContent;
                        let hasImagePrompt = false;
                        let numImages = 0;
                        let hasYouTubeVideo = false;
                        
                        try {
                            // Don't show anything until we have a reasonable amount of content
                            if (fullContent.length < 50) {
                                displayText = '';
                            } else {
                                // Try to parse as complete JSON first
                                try {
                                    const parsed = JSON.parse(fullContent);
                                    displayText = parsed.chatResponse || '';
                                } catch {
                                    // If not complete JSON, try regex extraction
                                    const chatResponseMatch = fullContent.match(/"chatResponse":\s*"((?:[^"\\]|\\.)*)"(?:\s*,|\s*})/);
                                    if (chatResponseMatch) {
                                        displayText = chatResponseMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                                    } else {
                                        // Still incomplete, show nothing
                                        displayText = '';
                                    }
                                }
                            }
                            
                            // Look for imagePrompt to determine if we should show skeleton
                            const imagePromptMatch = fullContent.match(/"imagePrompt":\s*"([^"]*(?:\\.[^"]*)*)"?/);
                            hasImagePrompt = imagePromptMatch && imagePromptMatch[1] && imagePromptMatch[1] !== 'null';
                            
                            // Look for youtubeVideo
                            const youtubeVideoMatch = fullContent.match(/"youtubeVideo":\s*"([^"]*(?:\\.[^"]*)*)"?/);
                            hasYouTubeVideo = youtubeVideoMatch && youtubeVideoMatch[1] && youtubeVideoMatch[1] !== 'null';
                            
                            // Look for numImages
                            const numImagesMatch = fullContent.match(/"numImages":\s*(\d+)/);
                            if (numImagesMatch) {
                                numImages = parseInt(numImagesMatch[1]) || 0;
                            }
                        } catch (e) {
                            // If JSON parsing fails, show raw content (fallback)
                            displayText = fullContent;
                        }
                        
                        onStreamUpdate(displayText, hasImagePrompt || hasYouTubeVideo, numImages);
                    }
                }
            } catch (streamError) {
                console.error('🔍 DEBUG: Streaming error:', streamError);
                console.error('🔍 DEBUG: fullContent at error:', fullContent);
            }
            
            console.log('🔍 DEBUG: Streaming completed. Final fullContent length:', fullContent.length);

            // Parse the final response with error handling
            try {
                if (!fullContent || fullContent.trim() === '') {
                    console.error('Empty response from streaming');
                    return { chatResponse: "Sorry, something went wrong with the chat response." };
                }
                return JSON.parse(fullContent);
            } catch (parseError) {
                console.error('Failed to parse final streaming response:', parseError);
                console.error('Raw content:', fullContent);
                return { chatResponse: "Sorry, something went wrong with the chat response." };
            }
        } else {
            // Non-streaming mode (fallback) with optimized parameters
            const response = await client.chat.completions.create({
                model: "gpt-3.5-turbo", // Use gpt-3.5-turbo for better rate limits
                messages: messagesWithSystem,
                max_tokens: 500, // Reduced token count to save on rate limits
                temperature: 0.7,
                response_format: { type: "json_object" },
            });
            const content = response.choices[0].message.content;
            console.log('Non-streaming response content:', content);
            
            try {
                if (!content || content.trim() === '') {
                    console.error('Empty response from non-streaming');
                    return { chatResponse: "Sorry, something went wrong with the chat response." };
                }
                return JSON.parse(content);
            } catch (parseError) {
                console.error('Failed to parse non-streaming response:', parseError);
                console.error('Raw content:', content);
                return { chatResponse: "Sorry, something went wrong with the chat response." };
            }
        }
    });
}

export async function generateImage(prompt, n = 1) {
    try {
        console.log('🔍 DEBUG: Original prompt:', prompt);
        console.log('🔍 DEBUG: Requested images:', n);
        
        // Use our proxy server to avoid CORS issues
        const useHttps = process.env.REACT_APP_USE_HTTPS === 'true';
        const protocol = useHttps ? 'https' : 'http';
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? window.location.origin 
            : `${protocol}://localhost:8080`;
        const url = `${baseUrl}/api/images?prompt=${encodeURIComponent(prompt)}`;
        
        console.log('🔍 DEBUG: Making request to proxy:', url);
        
        const response = await axios.get(url, {
            timeout: 15000 // 15 second timeout
        });
    
        console.log('🔍 DEBUG: Proxy response status:', response.status);
        console.log('🔍 DEBUG: Proxy response data:', response.data);
        console.log('🔍 DEBUG: Requested n images:', n);
        
        // Check if response is HTML (indicating routing issue)
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
            console.error('🔍 DEBUG: Server returned HTML instead of JSON - routing issue');
            return { images: [], imagesWithDimensions: [] };
        }
        
        const { images, imagesWithDimensions } = response.data || {};
        console.log('🔍 DEBUG: Server returned images count:', images?.length || 0);
        console.log('🔍 DEBUG: Server returned dimensions count:', imagesWithDimensions?.length || 0);
        
        if (!images || !Array.isArray(images)) {
            console.error('🔍 DEBUG: Invalid response format - no images array');
            return { images: [], imagesWithDimensions: [] };
        }
        
        const maxImages = Math.min(n, images.length);
        console.log('🔍 DEBUG: maxImages calculated:', maxImages);
        
        const resultArray = images.slice(0, maxImages);
        const dimensionsArray = imagesWithDimensions ? imagesWithDimensions.slice(0, maxImages) : [];
        
        console.log(`🔍 DEBUG: Final result - Found ${resultArray.length} unique images`);
        console.log('🔍 DEBUG: Image URLs:', resultArray);
        console.log('🔍 DEBUG: Image dimensions:', dimensionsArray);
        
        return {
            images: resultArray,
            imagesWithDimensions: dimensionsArray
        };
    } catch (error) {
        console.error('🔍 DEBUG: Error details:', error);
        console.error('🔍 DEBUG: Error message:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔍 DEBUG: Proxy server not running! Start it with: node server.js');
        }
        
        return [];
    }
}
