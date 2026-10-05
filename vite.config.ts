import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Middleware to detect unauthenticated requests on protected routes and 302 redirect to /login
function authRedirectPlugin(): Plugin {
  return {
    name: 'auth-redirect-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // Bypass static assets, Vite internal HMR/scripts, API proxies, and files with extensions
        if (
          !url ||
          url.startsWith('/api') ||
          url.startsWith('/ws') ||
          url.startsWith('/@') ||
          url.startsWith('/src') ||
          url.startsWith('/node_modules') ||
          url.includes('.')
        ) {
          return next();
        }

        // Public routes that do not require authentication
        if (url === '/login' || url === '/register' || url.startsWith('/verify')) {
          return next();
        }

        // Protected routes (/onboarding, /onboarding/*, /home, /dashboard, /, etc.)
        const cookieHeader = req.headers.cookie || '';
        const cookies = cookieHeader.split(';').map((c) => c.trim());
        const hasValidAccessToken = cookies.some(
          (c) => c.startsWith('access_token=') && c.split('=')[1]?.length > 10
        );
        const hasValidRefreshToken = cookies.some(
          (c) => c.startsWith('refresh_token=') && c.split('=')[1]?.length > 10
        );

        if (!hasValidAccessToken && !hasValidRefreshToken) {
          res.writeHead(302, {
            Location: '/login',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          });
          res.end();
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), authRedirectPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/security': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/onboarding': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/user': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/notifications': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/audit': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/orgs': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/workspaces': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/billing': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/agents': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/campaigns': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/audiences': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/phone-numbers': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/kb': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/api-keys': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/webhooks': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/analytics': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/calls': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8084',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
