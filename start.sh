#!/bin/bash

# Auth App - Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Auth Application..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}Checking MongoDB...${NC}"
if ! lsof -i :27017 > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Starting MongoDB...${NC}"
    mongod --dbpath ./data > /dev/null 2>&1 &
    sleep 2
    echo -e "${GREEN}✓ MongoDB started${NC}"
else
    echo -e "${GREEN}✓ MongoDB is already running${NC}"
fi

echo ""
echo -e "${BLUE}Starting Backend Server...${NC}"

# Kill any existing process on port 5001
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null

# Start backend in background
cd backend
node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 2

if lsof -i :5001 > /dev/null; then
    echo -e "${GREEN}✓ Backend running on port 5001 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}✗ Backend failed to start. Check logs/backend.log${NC}"
fi

echo ""
echo -e "${BLUE}Starting Frontend Server...${NC}"

# Kill any existing process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null

# Start frontend in background
cd frontend
PORT=3000 npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 5

if lsof -i :3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend running on port 3000 (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}✗ Frontend failed to start. Check logs/frontend.log${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Application is Ready!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "📱 Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "🔌 Backend:  ${BLUE}http://localhost:5001${NC}"
echo -e "🗄️  MongoDB:  ${BLUE}http://localhost:27017${NC}"
echo ""
echo -e "📝 Logs:"
echo -e "  Backend:  logs/backend.log"
echo -e "  Frontend: logs/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for user interrupt
wait
