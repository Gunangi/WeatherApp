@echo off
echo 🧹 Performing complete project cleanup...
echo ========================================

echo 🗑️ Cleaning Gradle build files...
gradlew.bat clean

echo 🗑️ Cleaning React build files...
gradlew.bat cleanReact

echo 🗑️ Removing additional build artifacts...
if exist "build" rmdir /s /q "build"
if exist "src\main\resources\static" rmdir /s /q "src\main\resources\static"
if exist ".gradle" rmdir /s /q ".gradle"

echo 🗑️ Cleaning npm cache...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

echo ✅ Cleanup complete!
echo.
echo 📝 Next steps:
echo    1. Run: gradlew.bat build --info
echo    2. If successful, run: gradlew.bat bootRun
echo.
pause