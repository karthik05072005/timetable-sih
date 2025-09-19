# Deployment Guide

## Overview

This guide covers different deployment options for the Timetable AI system.

## Prerequisites

- Node.js 18+ environment
- MongoDB database (local or cloud)
- Domain name (for production)

## Environment Variables

Ensure these environment variables are set:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017  # or MongoDB Atlas connection string
DB_NAME=timetable_ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com

# Next.js Configuration
NODE_ENV=production
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides seamless deployment for Next.js applications.

#### Step 1: Prepare for Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

#### Step 2: Configure Environment Variables

1. Create `.env.local` with production values
2. Add environment variables in Vercel dashboard or CLI:
   ```bash
   vercel env add MONGO_URL
   vercel env add DB_NAME
   vercel env add JWT_SECRET
   vercel env add CORS_ORIGINS
   ```

#### Step 3: Deploy

```bash
# First deployment
vercel

# Subsequent deployments
vercel --prod
```

#### Step 4: Set up MongoDB Atlas

1. Create MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGO_URL` environment variable

### 2. Netlify

While Netlify doesn't natively support API routes, you can use Netlify Functions.

#### Step 1: Configure Build

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

#### Step 2: Convert API Routes

Convert Next.js API routes to Netlify Functions format.

### 3. Digital Ocean App Platform

#### Step 1: Create App

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm start`

#### Step 2: Environment Variables

Add environment variables in the Digital Ocean dashboard.

#### Step 3: Database

Set up MongoDB on Digital Ocean or use MongoDB Atlas.

### 4. AWS (EC2 + RDS)

#### Step 1: Launch EC2 Instance

1. Choose Ubuntu 20.04 LTS
2. Configure security groups (ports 22, 80, 443, 3000)
3. SSH into instance

#### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/timetable-ai.git
cd timetable-ai

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "timetable-ai" -- start
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/timetable-ai`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/timetable-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### 5. Docker Deployment

#### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - DB_NAME=timetable_ai
      - JWT_SECRET=your-secret-key
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

#### Step 3: Deploy

```bash
docker-compose up -d
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test database connectivity
- [ ] Test file upload functionality
- [ ] Test timetable generation
- [ ] Test PDF/Excel export
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up SSL certificate
- [ ] Configure domain and DNS
- [ ] Test performance under load

## Monitoring and Maintenance

### Health Checks

Implement health check endpoints:
```javascript
// app/api/health/route.js
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  })
}
```

### Logging

Use structured logging:
```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### Backup Strategy

1. **Database Backups**: Set up automated MongoDB backups
2. **File Backups**: Backup uploaded files if storing locally
3. **Code Backups**: Ensure code is in version control

### Performance Optimization

1. **Caching**: Implement Redis for session storage
2. **CDN**: Use CDN for static assets
3. **Database Indexing**: Add indexes for frequently queried fields
4. **Connection Pooling**: Configure MongoDB connection pooling

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify connection string and firewall rules
3. **Environment Variables**: Ensure all required variables are set
4. **Memory Issues**: Increase memory allocation for large datasets
5. **Port Conflicts**: Check if ports are available

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=*
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS for your domain only
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs
6. **Database Security**: Use strong passwords and connection encryption

## Support

For deployment issues:
1. Check the logs for error messages
2. Review environment variable configuration
3. Test database connectivity
4. Check firewall and security group settings
5. Open an issue on GitHub with deployment details