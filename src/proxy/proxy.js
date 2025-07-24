import { useState, useEffect } from 'react';

const Proxy = ({ url, method = 'GET', headers = {}, body = null, onData, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // URL вашей прокси-функции на Vercel
        const proxyUrl = `https://your-vercel-app.vercel.app/api/proxy?url=${encodeURIComponent(url)}`;
        
        const requestOptions = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined
        };

        const response = await fetch(proxyUrl, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        if (onData) onData(result);
      } catch (err) {
        setError(err.message);
        if (onError) onError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, headers, body, onData, onError]);

  return { loading, error, data };
};

export default Proxy;
