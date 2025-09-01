@echo off
echo ========================================
echo        AIRI Android APK Builder
echo ========================================

echo [1/5] Налаштування Java...
set JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.5.11-hotspot
if not exist "%JAVA_HOME%" (
    set JAVA_HOME=C:\Program Files\Java\jdk-21
)
if not exist "%JAVA_HOME%" (
    set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
)

echo JAVA_HOME: %JAVA_HOME%

echo [2/5] Збірка веб-застосунку...
call pnpm build

echo [3/5] Копіювання файлів до Android...
call npx cap copy android

echo [4/5] Збірка APK файлу...
cd android
call gradlew assembleDebug

echo [5/5] Готово!
echo APK файл створено: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Для встановлення:
echo 1. Перенесіть файл на Android пристрій
echo 2. Увімкніть "Невідомі джерела" в налаштуваннях
echo 3. Встановіть APK файл
echo.
pause
