@echo off
echo 🚀 Quick Fix for Weather App
echo ============================

echo 1️⃣ Backing up current build.gradle...
if exist "build.gradle" copy "build.gradle" "build.gradle.backup"

echo 2️⃣ Using simplified build configuration...
echo This will temporarily remove React integration to test backend only.
echo.

echo 3️⃣ Cleaning project...
gradlew.bat clean > nul 2>&1

echo 4️⃣ Testing Java compilation...
gradlew.bat compileJava
if %ERRORLEVEL% neq 0 (
    echo ❌ Java compilation failed. Check your Java installation and code.
    echo 📋 Java version:
    java -version
    pause
    exit /b 1
)

echo ✅ Java compilation successful!
echo.
echo 5️⃣ Attempting to run Spring Boot...
echo 🌐 Application will be available at: http://localhost:8080
echo ⚠️ Note: Frontend will not be available in this mode
echo.

gradlew.bat bootRun

pause