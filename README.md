# Status App

A real-time status tracking application with authentication and team management features.

## Setup for Different Domains

### Frontend Setup

1. Update the configuration in `status-app/js/config.js`:
   ```javascript
   const config = {
       production: {
           API_URL: 'https://your-backend-domain.com',  // Replace with your backend domain
           SOCKET_URL: 'wss://your-backend-domain.com'  // Replace with your backend WebSocket URL
       }
   };
   ```

2. Deploy the frontend files:
   - Upload all files from the `status-app` directory to your web server
   - Configure your web server to serve `index.html` as the default page
   - Ensure all routes redirect to `index.html` for client-side routing

### Backend Setup

1. Update CORS configuration in `server/server.js`:
   ```javascript
   const corsOptions = {
       origin: ['https://your-frontend-domain.com'],  // Replace with your frontend domain
       methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
       allowedHeaders: ['Content-Type', 'Authorization'],
       credentials: true
   };
   ```

2. Set up the backend server:
   ```bash
   cd server
   npm install
   npm start
   ```

3. Environment Variables:
   Create a `.env` file in the server directory:
   ```
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Security Considerations

1. SSL/TLS:
   - Both frontend and backend should use HTTPS
   - WebSocket connections should use WSS

2. CORS:
   - Configure CORS to only allow requests from your frontend domain
   - Enable credentials for cross-domain requests

3. Authentication:
   - Default admin credentials:
     - Username: admin
     - Password: 1234
   - Change these credentials after first login
   - Enable password reset functionality

### Development Setup

1. Local frontend development:
   ```bash
   cd status-app
   # Use any static file server
   python -m http.server 5500
   ```

2. Local backend development:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. Development configuration is automatically used when running on localhost

### Testing

1. Access the application:
   - Production: https://your-frontend-domain.com
   - Development: http://localhost:5500

2. Test authentication:
   - Register a new account
   - Verify email (check console for test email links)
   - Login with credentials
   - Test password reset

3. Test real-time features:
   - Create teams
   - Update team status
   - Add team members
   - Update individual status

### Troubleshooting

1. CORS Issues:
   - Verify CORS configuration matches your domains
   - Check browser console for CORS errors
   - Ensure credentials are properly configured

2. WebSocket Connection:
   - Verify WebSocket URL in config matches backend
   - Check for SSL/TLS certificate issues
   - Monitor browser console for connection errors

3. Authentication Issues:
   - Clear browser storage
   - Check network requests in browser dev tools
   - Verify API endpoints are accessible

### Support

For issues and feature requests, please create an issue in the repository.
