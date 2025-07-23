import OpenAI from "openai";
import axios from "axios";
import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";

const client = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

export async function getOpenAIResponse(messages, onStreamUpdate = null) {
    try {
        // Add system prompt for detailed responses
        const systemPrompt = {
            role: "system",
            content: SYSTEM_PROMPT
        };

        const messagesWithSystem = [systemPrompt, ...messages];

        if (onStreamUpdate) {
            // Streaming mode
            const stream = await client.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages: messagesWithSystem,
                max_tokens: 800,
                temperature: 0.7,
                response_format: { type: "json_object" },
                stream: true,
            });

            let fullContent = '';
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullContent += content;
                    
                    // Try to extract chatResponse, imagePrompt, and youtubeVideo from partial JSON during streaming
                    let displayText = fullContent;
                    let hasImagePrompt = false;
                    let numImages = 0;
                    let hasYouTubeVideo = false;
                    
                    try {
                        // Look for chatResponse in the partial JSON
                        const chatResponseMatch = fullContent.match(/"chatResponse":\s*"([^"]*(?:\\.[^"]*)*)"?/);
                        if (chatResponseMatch) {
                            // Unescape JSON string
                            displayText = chatResponseMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
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

            return JSON.parse(fullContent);
        } else {
            // Non-streaming mode (fallback)
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages: messagesWithSystem,
                max_tokens: 800,
                temperature: 0.7,
                response_format: { type: "json_object" },
            });
            console.log(response.choices[0].message.content)
            return JSON.parse(response.choices[0].message.content);
        }
    } catch (error) {
        console.error("Error getting response from OpenAI:", error);
        return { chatResponse: "Sorry, something went wrong with the chat response." };
    }
}

export async function generateImage(prompt, n = 1) {
    try {
        console.log('🔍 DEBUG: Original prompt:', prompt);
        console.log('🔍 DEBUG: Requested images:', n);
        
        // Use our proxy server to avoid CORS issues
        const url = `http://localhost:3001/api/images?prompt=${encodeURIComponent(prompt)}`;
        
        console.log('🔍 DEBUG: Making request to proxy:', url);
        
        const response = await axios.get(url, {
            timeout: 15000 // 15 second timeout
        });
    
        console.log('🔍 DEBUG: Proxy response status:', response.status);
        console.log('🔍 DEBUG: Proxy response data:', response.data);
        console.log('🔍 DEBUG: Requested n images:', n);
        
        const { images, imagesWithDimensions } = response.data;
        console.log('🔍 DEBUG: Server returned images count:', images?.length || 0);
        console.log('🔍 DEBUG: Server returned dimensions count:', imagesWithDimensions?.length || 0);
        
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
