@echo off
echo 🔍 Debug Build Process
echo =====================

echo 📋 Checking Java version...
java -version
echo.

echo 📋 Checking project structure...
if exist "src\main\java\com\example\weatherapp\WeatherAppApplication.java" (
    echo ✅ Main class file exists
) else (
    echo ❌ Main class file NOT found
    echo Expected: src\main\java\com\example\weatherapp\WeatherAppApplication.java
    pause
    exit /b 1
)

echo.
echo 🔨 Step 1: Compile Java sources only...
gradlew.bat compileJava --info
if %ERRORLEVEL% neq 0 (
    echo ❌ Java compilation failed!
    pause
    exit /b 1
)

echo.
echo 📦 Step 2: Build JAR without React (test backend only)...
gradlew.bat bootJar --info
if %ERRORLEVEL% neq 0 (
    echo ❌ JAR build failed!
    pause
    exit /b 1
)

echo.
echo 🚀 Step 3: Try running the JAR directly...
echo Location: build\libs\WeatherApp-0.0.1-SNAPSHOT.jar
if exist "build\libs\WeatherApp-0.0.1-SNAPSHOT.jar" (
    echo ✅ JAR file created successfully
    echo 🔥 Attempting to run JAR...
    java -jar build\libs\WeatherApp-0.0.1-SNAPSHOT.jar
) else (
    echo ❌ JAR file not found!
    echo 📁 Contents of build\libs:
    dir build\libs
)

pause