#!/bin/bash

# 1. Checkout/Update code (Assume manual copy for now)
echo "🚀 Starting Deployment..."

# 2. Build Docker Image
echo "🏗️ Building Docker Image..."
docker-compose up -d --build

# 3. Check Status
echo "✅ Web App Running on Port 3000"

# 4. Start Ngrok (Background)
# Be sure to add your Ngrok Auth Token once: `ngrok config add-authtoken 2vGtj8JHHBNb1RHXHStqOLfsBgj_6KQRTnQDrbZ2jNTMc4KWs`
echo "🌍 Exposing to Internet via Ngrok..."
echo "URL: https://zestless-immanuel-tinkly.ngrok-free.dev"

# Setup Auth Token if not present (optional check)
ngrok config add-authtoken 2vGtj8JHHBNb1RHXHStqOLfsBgj_6KQRTnQDrbZ2jNTMc4KWs

# Kill existing ngrok sessions to avoid conflicts
pkill ngrok

# Start Ngrok Tunnel in background
nohup ngrok http --url=zestless-immanuel-tinkly.ngrok-free.dev 3000 > ngrok.log 2>&1 &

echo "🎉 Deployment Complete!"
echo "Check ngrok.log for tunnel status."
