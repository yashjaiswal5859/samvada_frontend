# ==========================================
# Build Stage: Compile Vite SPA
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies with lockfile caching
COPY package.json ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source and build production bundle
COPY . .
RUN pnpm run build

# ==========================================
# Production Runtime Stage: NGINX Alpine
# ==========================================
FROM nginx:1.25-alpine

# Copy custom NGINX configuration for SPA routing
RUN cat <<'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

