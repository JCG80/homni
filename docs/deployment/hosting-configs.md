# Hosting Configuration for Mobile/PC Parity

## Overview
This document provides configuration templates for different hosting platforms to ensure Mobile/PC parity and prevent routing issues.

## Netlify Configuration

### `_redirects` file (place in `public/_redirects`):
```
# SPA fallback - all routes serve index.html
/*    /index.html   200

# Optional: API proxy (if needed)
/api/*  https://your-api-domain.com/api/:splat  200
```

### `netlify.toml` (optional):
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  VITE_ROUTER_MODE = "browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Vercel Configuration

### `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_ROUTER_MODE": "browser"
  }
}
```

## Apache Configuration

### `.htaccess` (place in `dist/.htaccess` after build):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle Angular and Vue.js client side routing
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## Nginx Configuration

### Add to server block:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

# Optional: Add cache headers for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Environment Variables by Platform

### Development (.env.local)
```bash
VITE_ROUTER_MODE=browser
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Preview/Staging (.env.preview)
```bash
VITE_ROUTER_MODE=hash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Production (.env.production)
```bash
# VITE_ROUTER_MODE not set - defaults to browser
VITE_SUPABASE_URL=your-prod-supabase-url
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

## Troubleshooting

### Common Issues:

1. **Blank page on direct URL access**
   - Ensure rewrites/redirects are configured
   - Check that `VITE_ROUTER_MODE` matches deployment type

2. **404 on refresh**
   - Missing SPA fallback configuration
   - Incorrect rewrite rules

3. **Assets not loading**
   - Check `base` configuration in vite.config.ts
   - Verify asset paths are relative

4. **CORS errors**
   - Verify Supabase URL and key are set
   - Check network requests in DevTools
   - Run `npm run check:env` before deployment

### Validation Commands:

```bash
# Check environment and CORS
npm run check:env

# Validate repository health
npm run check:health

# Test build process
npm run build && npm run preview
```

## Hash Router vs Browser Router

### Use Hash Router when:
- Deploying to static hosting without server-side routing support
- Preview environments (Lovable, GitHub Pages, etc.)
- Cannot configure server rewrites

### Use Browser Router when:
- Full server control with proper rewrites
- Production environments with SEO requirements
- Better URL aesthetics needed

## Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Router mode matches hosting capabilities
- [ ] Rewrites/redirects configured
- [ ] CORS validation passing
- [ ] Repository health checks green
- [ ] Service worker cleared in dev/preview
- [ ] Token cleanup implemented
- [ ] Deep links tested on target platform