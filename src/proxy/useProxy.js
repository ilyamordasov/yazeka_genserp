import { useState, useEffect } from 'react';

export const useProxy = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // URL вашей прокси-функции на Vercel
        const proxyUrl = `https://your-vercel-app.vercel.app/api/proxy?url=${encodeURIComponent(url)}`;
        
        const { method = 'GET', headers = {}, body = null } = options;
        
        const requestOptions = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        };
        
        if (body && method !== 'GET') {
          requestOptions.body = JSON.stringify(body);
        }
        
        const response = await fetch(proxyUrl, requestOptions);
        
        if (!response.ok) {
          throw new Error(`Ошибка при запросе: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
};
