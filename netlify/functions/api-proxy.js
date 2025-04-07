const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  // Get the path from the event
  const path = event.path.replace('/.netlify/functions/api-proxy', '');
  
  // Get the backend URL from environment variables
  const backendUrl = process.env.BACKEND_URL || 'https://bgf-dash-backend.onrender.com';
  
  // Construct the full URL
  const url = `${backendUrl}${path}`;
  
  console.log(`Proxying request to: ${url}`);
  
  try {
    // Make the request to the backend
    const response = await new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const options = {
        method: event.httpMethod,
        headers: {
          ...event.headers,
          host: new URL(backendUrl).host,
        },
      };
      
      const req = client.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (event.body) {
        req.write(event.body);
      }
      
      req.end();
    });
    
    // Return the response
    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': response.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: response.body,
    };
  } catch (error) {
    console.error('Error proxying request:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error proxying request to backend' }),
    };
  }
};
