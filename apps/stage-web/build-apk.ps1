Write-Host "========================================"
Write-Host "       AIRI Android APK Builder"
Write-Host "========================================"

Write-Host "[1/5] Налаштування Java..." -ForegroundColor Green

# Спробуємо знайти Java
$javaPaths = @(
    "C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot",
    "C:\Program Files\Microsoft\jdk-21.0.5.11-hotspot",
    "C:\Program Files\Java\jdk-21",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Android\Android Studio\jbr"
)

$javaHome = $null
foreach ($path in $javaPaths) {
    if (Test-Path $path) {
        $javaHome = $path
        break
    }
}

if ($javaHome) {
    $env:JAVA_HOME = $javaHome
    Write-Host "JAVA_HOME встановлено: $javaHome" -ForegroundColor Yellow
} else {
    Write-Host "Java не знайдено! Встановіть JDK 17 або 21" -ForegroundColor Red
    exit 1
}

Write-Host "[2/5] Збірка веб-застосунку..." -ForegroundColor Green
& pnpm build

Write-Host "[3/5] Копіювання файлів до Android..." -ForegroundColor Green
& npx cap copy android

Write-Host "[4/5] Збірка APK файлу..." -ForegroundColor Green
Set-Location android
& .\gradlew assembleDebug

Write-Host "[5/5] Готово!" -ForegroundColor Green
Write-Host "APK файл створено: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan

Write-Host ""
Write-Host "Для встановлення:" -ForegroundColor Yellow
Write-Host "1. Перенесіть файл на Android пристрій"
Write-Host "2. Увімкніть 'Невідомі джерела' в налаштуваннях"
Write-Host "3. Встановіть APK файл"

Read-Host "Натисніть Enter для завершення"
