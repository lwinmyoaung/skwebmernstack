# Skins Collector Deployment Guide

This guide outlines the steps to deploy the **Skins Collector** MERN application to a Linux server (Ubuntu recommended), specifically handling scenarios where port 80/443 are shared with other projects.

## 1. Prerequisites
- A Linux server (VPS)
- Domain name pointing to your server IP (`skinscollector.com`)
- Node.js (v18+) and NPM installed
- MongoDB Atlas account (or local MongoDB)

## 2. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install pm2 -g
```

## 3. Clone and Prepare Project
```bash
# Clone your repository
git clone <your-repo-url>
cd <project-folder>/mern-stack

# Setup Backend Environment
cd backend
cp .env.example .env
nano .env  # Edit with your production MONGO_URI, JWT_SECRET, and CLIENT_URL

# Setup Frontend Environment
cd ../frontend
cp .env.example .env
nano .env  # Edit VITE_API_URL to https://skinscollector.com/api/v1
```

## 4. Build and Start
```bash
# Install backend dependencies
cd ../backend
npm install

# Build frontend (this will create the 'dist' folder)
cd ../frontend
npm install
npm run build

# Start the application with PM2 from the backend folder
cd ../backend
pm2 start server.js --name "skins-collector"

# Save PM2 process list
pm2 save
pm2 startup
```

## 5. Nginx Configuration (MERN Proxy)
Install Nginx:
```bash
sudo apt install nginx -y
```
Create a config file: `sudo nano /etc/nginx/sites-available/skinscollector`

```nginx
# HTTP - Redirect to HTTPS
server { 
     listen 80; 
     listen [::]:80; 
     server_name skinscollector.com www.skinscollector.com; 
     
     # This can coexist with other projects on port 80
     return 301 https://skinscollector.com$request_uri;  
} 

# HTTPS
server { 
     listen 443 ssl http2; 
     listen [::]:443 ssl http2; 
     server_name skinscollector.com www.skinscollector.com; 
  
     # POINT TO YOUR REACT BUILD FOLDER
     root /var/www/skwebmernstack/mern-stack/frontend/dist; 
     index index.html; 
  
     # SSL Settings (Ensure these paths are correct)
     ssl_certificate /etc/letsencrypt/live/skinscollector.com/fullchain.pem; 
     ssl_certificate_key /etc/letsencrypt/live/skinscollector.com/privkey.pem; 
     ssl_protocols TLSv1.2 TLSv1.3; 
     ssl_session_cache shared:SSL:10m; 
     ssl_session_timeout 10m; 
  
     # Security Headers
     add_header X-Frame-Options "SAMEORIGIN" always; 
     add_header X-Content-Type-Options "nosniff" always; 
     add_header Referrer-Policy "strict-origin-when-cross-origin" always; 
  
     charset utf-8; 
  
     # Upload / Buffer Optimization
     client_max_body_size 64M; 
     client_body_buffer_size 32M; 
  
     # Static Assets (Images/Uploads from Public folder)
     location /uploads/ {
         alias /var/www/skwebmernstack/mern-stack/frontend/public/uploads/;
         expires 1y;
         add_header Cache-Control "public, immutable";
         access_log off;
     }

     location /adminimages/ {
         alias /var/www/skwebmernstack/mern-stack/frontend/public/adminimages/;
         expires 1y;
         add_header Cache-Control "public, immutable";
         access_log off;
     }

     # Main React Routing (Frontend)
     location / { 
         try_files $uri $uri/ /index.html; 
     } 
  
     # Backend API Proxy (Node.js Port 5000)
     location /api/ { 
         proxy_pass http://localhost:5000;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
     } 
  
     # Block Hidden Files
     location ~ /\.(?!well-known).* { 
         deny all; 
         access_log off; 
         log_not_found off; 
     } 
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/skinscollector /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL (HTTPS)
If you don't have SSL yet:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d skinscollector.com -d www.skinscollector.com
```

## 7. Ongoing Maintenance
- **View Logs**: `pm2 logs skins-collector`
- **Restart**: `pm2 restart skins-collector`
- **Updates**: 
  ```bash
  git pull
  cd backend && npm install
  cd ../frontend && npm install && npm run build
  pm2 restart skins-collector
  ```
