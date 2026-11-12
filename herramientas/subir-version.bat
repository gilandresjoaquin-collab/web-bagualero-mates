@echo off
rem Sube la versión de los CSS y JS en todas las páginas (ver subir-version.php).
rem Usa el PHP de XAMPP: el proyecto está en xampp\htdocs\<carpeta>, así que PHP está en xampp\php.
chcp 65001 > nul
set "PHP=%~dp0..\..\..\php\php.exe"
if not exist "%PHP%" set "PHP=php"
"%PHP%" "%~dp0subir-version.php" %*
pause
