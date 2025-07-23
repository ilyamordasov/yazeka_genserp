import './App.css';

import React, { useState, useEffect, useRef } from 'react';
import InputGroup from "./components/base/moleculas/InputGroup";
import Container from 'react-bootstrap/Container';
import Header from './components/base/moleculas/Header';
import MessageBubble from './components/base/moleculas/MessageBubble';
import YazekaImageBlock from './components/templates/moleculas/YazekaImageBlock';
import { getOpenAIResponse, generateImage } from './api';

function App() {
  const [inputActive, setInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const isStreamingRef = useRef(false);

  // Auto-scroll function
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'instant',
      block: 'end'
    });
  };

  // Auto-scroll when messages change or during streaming
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Immediate scroll for new messages, smooth scroll during streaming
      if (lastMessage.sender === 'bot' && lastMessage.isStreaming) {
        scrollToBottom(false); // Instant scroll during streaming
      } else {
        scrollToBottom(true); // Smooth scroll for completed messages
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim()) {
      const userMessage = { text: inputValue, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      const currentInputValue = inputValue;
      setInputValue('');
      setInputActive(false);
      setLoading(true);

      const openAIMessages = [
        {
          role: "system",
          content: `You are an intelligent assistant. If the user wants images, respond with a JSON object: { "imagePrompt": "...", "chatResponse": "...", "numImages": 1-5 }. "imagePrompt" should be a creative prompt for image search. "numImages" should be: 1 for single image requests, 2-3 for "some" or "few" images, 4-5 for "many", "gallery", or "multiple" images. Base the number on the user's request context and intent. If the user does not want images, respond with { "chatResponse": "..." } only. Examples: User: 'Show me a cat' Response: { "imagePrompt": "cute cat", "chatResponse": "Here's a cat:", "numImages": 1 } User: 'Show me some pictures of dogs' Response: { "imagePrompt": "dogs", "chatResponse": "Here are some dog pictures:", "numImages": 3 } User: 'I want many sunset photos' Response: { "imagePrompt": "beautiful sunset", "chatResponse": "Here are sunset photos:", "numImages": 5 } User: 'What is the capital of France?' Response: { "chatResponse": "The capital of France is Paris." }`
        },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: currentInputValue }
      ];

      // Create initial bot message for streaming
      const botMessage = { 
        text: '', 
        sender: 'bot', 
        showImage: false, 
        imageUrls: [], 
        expectedImages: 0, 
        imageDimensions: [],
        youtubeVideo: null,
        isStreaming: true 
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setLoading(false);
      isStreamingRef.current = true;

      let streamingText = '';
      const onStreamUpdate = (content, hasImagePrompt = false, numImages = 0) => {
        streamingText = content;
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.sender === 'bot') {
            lastMessage.text = content;
            lastMessage.showImage = hasImagePrompt;
            lastMessage.expectedImages = numImages;
            lastMessage.isStreaming = true;
          }
          return newMessages;
        });
      };

      try {
        const openAIResponse = await getOpenAIResponse(openAIMessages, onStreamUpdate);
        console.log("🚀 DEBUG: OpenAI response:", openAIResponse);
        
        let { imagePrompt, chatResponse, numImages, youtubeVideo } = openAIResponse;
        let imageUrls = [];
        let imageDimensions = [];
        
        console.log("🚀 DEBUG: YouTube video from response:", youtubeVideo);
        
        if (imagePrompt) {
          console.log("🚀 DEBUG: Image prompt detected, generating images...");
          const n = numImages || 5;
          console.log("🚀 DEBUG: Requesting", n, "images for prompt:", imagePrompt);
          const imageResult = await generateImage(imagePrompt, n);
          console.log("🚀 DEBUG: Generated image result:", imageResult);
          
          // Handle both old format (array) and new format (object)
          if (Array.isArray(imageResult)) {
            imageUrls = imageResult;
            imageDimensions = [];
          } else {
            imageUrls = imageResult.images || [];
            imageDimensions = imageResult.imagesWithDimensions || [];
          }
          
          console.log("🚀 DEBUG: imageUrls length:", imageUrls.length);
          console.log("🚀 DEBUG: imageDimensions:", imageDimensions);
        } else {
          console.log("🚀 DEBUG: No image prompt, skipping image generation");
        }

        // Update final message with images and video
        isStreamingRef.current = false;
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.sender === 'bot') {
            lastMessage.text = chatResponse || streamingText;
            lastMessage.showImage = !!imagePrompt || !!youtubeVideo;
            lastMessage.imageUrls = imageUrls;
            lastMessage.expectedImages = imagePrompt ? (numImages || 5) : 0;
            lastMessage.imageDimensions = imageDimensions;
            lastMessage.youtubeVideo = youtubeVideo;
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
      } catch (error) {
        console.error("🚀 DEBUG: Error in streaming:", error);
        isStreamingRef.current = false;
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.sender === 'bot') {
            lastMessage.text = "Sorry, something went wrong with the response.";
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
      }
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        background: '#fff',
        padding: 16,
        paddingBottom: 0,
        zIndex: 100
      }}>
        <Header />
      </div>
      <Container
        fluid
        style={{
          flex: 1,
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          paddingTop: 0,
          paddingBottom: 100, // Space for pinned input
          overflowY: 'auto',
          gap: 16,
        }}
        className="m-0"
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const nextMsg = messages[idx + 1];
            
            // Calculate spacing
            let marginTop = 0;
            let marginBottom = 0;
            
            if (msg.sender === 'user') {
              // User bubble: 24px after previous bot response
              if (prevMsg && prevMsg.sender === 'bot') {
                marginTop = 24;
              }
              // 16px before next bot response
              if (nextMsg && nextMsg.sender === 'bot') {
                marginBottom = 16;
              }
            } else if (msg.sender === 'bot') {
              // Bot response: 16px after user bubble
              if (prevMsg && prevMsg.sender === 'user') {
                marginTop = 16;
              }
              // 24px before next user bubble  
              if (nextMsg && nextMsg.sender === 'user') {
                marginBottom = 24;
              }
            }
            
            if (msg.sender === 'bot') {
              return (
                <div key={idx} style={{ marginTop, marginBottom }}>
                  <YazekaImageBlock 
                    showImage={msg.showImage} 
                    text={msg.text} 
                    imageUrls={msg.imageUrls} 
                    expectedImages={msg.expectedImages} 
                    imageDimensions={msg.imageDimensions}
                    youtubeVideo={msg.youtubeVideo}
                    isStreaming={msg.isStreaming}
                  />
                </div>
              );
            }
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'flex-end', marginTop, marginBottom }}>
                <MessageBubble text={msg.text} />
              </div>
            );
          })}
          {loading && <p>Yazeka is thinking...</p>}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </Container>
      <div style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        padding: 16,
        zIndex: 100
      }}>
        <InputGroup
          figmaActive={inputActive}
          onInputFocus={() => setInputActive(true)}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

export default App;
