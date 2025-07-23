import { useState, useEffect } from 'react';

const useTypingEffect = (text, speed = 30) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setIsTyping(true);
    setDisplayedText('');
    
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      
      if (index >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};

export default useTypingEffect;