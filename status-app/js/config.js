// Configuration for different environments
const config = {
    development: {
        API_URL: 'http://localhost:3000',
        SOCKET_URL: 'http://localhost:3000'
    },
    production: {
        // Replace these with your actual backend server URLs
        API_URL: 'https://api.your-backend-domain.com',
        SOCKET_URL: 'wss://api.your-backend-domain.com'
    }
};

// Set the current environment
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';

// Export the configuration
const currentConfig = config[ENV];
export default currentConfig;
