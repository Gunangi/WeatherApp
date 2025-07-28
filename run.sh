#!/bin/bash

# Weather App Startup Script

echo "🌤️  Starting WeatherNow Application..."
echo "======================================"

# Check if MongoDB is running
echo "📦 Checking MongoDB status..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."

    # Try different MongoDB start commands based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start mongodb-community > /dev/null 2>&1 || brew services start mongodb/brew/mongodb-community > /dev/null 2>&1
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start mongod > /dev/null 2>&1 || sudo service mongod start > /dev/null 2>&1
    else
        echo "⚠️  Please start MongoDB manually on Windows"
    fi

    # Wait a moment for MongoDB to start
    sleep 3
fi

# Check if MongoDB is now running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB failed to start. Please start it manually."
    echo "   macOS: brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo "   Windows: Start MongoDB service from Services"
    exit 1
fi

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
./gradlew cleanReact > /dev/null 2>&1

# Build and run the application
echo "🔨 Building React frontend..."
echo "🚀 Building and starting Spring Boot backend..."
echo ""
echo "The application will be available at: http://localhost:8080"
echo "Press Ctrl+C to stop the application"
echo ""

# Run the application
./gradlew bootRun