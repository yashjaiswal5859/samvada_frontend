import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Validate if the access token in cookies is active (unexpired & verified by backend)
async function isTokenActive(cookieHeader: string): Promise<boolean> {
  if (!cookieHeader || !cookieHeader.includes('access_token=')) {
    return false;
  }

  // 1. Fast decode & expiration check for JWT access_token
  const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (!match || !match[1]) return false;
  const token = decodeURIComponent(match[1].trim());

  // Check if JWT payload is well-formed and unexpired
  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        // Token has expired - not active!
        return false;
      }
    } catch {
      return false;
    }
  } else {
    // Malformed token - not active
    return false;
  }

  // 2. Cryptographic & session validity check against ABS service
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const resp = await fetch('http://localhost:8082/api/v1/user/me', {
      headers: {
        Cookie: cookieHeader,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const body = (await resp.json()) as { success?: boolean };
      return Boolean(body?.success);
    }
    return false;
  } catch {
    return false;
  }
}

// Middleware to detect unauthenticated requests on protected routes and redirect active sessions to /home
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

        const cookieHeader = req.headers.cookie || '';

        // If user accesses root "/", verify if token is ACTUALLY ACTIVE before redirecting to /home
        if (url === '/') {
          const active = await isTokenActive(cookieHeader);
          if (active) {
            res.writeHead(302, {
              Location: '/home',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            });
            res.end();
            return;
          }
          // If token is not active or absent, show landing page normally
          return next();
        }

        // Public routes that do not require authentication
        if (url === '/login') {
          return next();
        }

        // Protected routes (/onboarding, /home, /dashboard, etc.)
        const cookies = cookieHeader.split(';').map((c) => c.trim());
        const hasTokenHint = cookies.some(
          (c) => (c.startsWith('access_token=') || c.startsWith('refresh_token=')) && c.split('=')[1]?.length > 10
        );

        if (!hasTokenHint) {
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
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true,
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
      '/api/v1/integrations': {
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
