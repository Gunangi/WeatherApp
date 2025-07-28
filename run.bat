@echo off
echo 🌤️  Starting WeatherNow Application...
echo ======================================

echo 📦 Please ensure MongoDB is running before continuing...
echo    You can start MongoDB from Windows Services or MongoDB Compass
echo.

pause

echo 🧹 Cleaning previous builds...
gradlew.bat cleanReact >nul 2>&1

echo 🔨 Building React frontend...
echo 🚀 Building and starting Spring Boot backend...
echo.
echo The application will be available at: http://localhost:8080
echo Press Ctrl+C to stop the application
echo.

gradlew.bat bootRun