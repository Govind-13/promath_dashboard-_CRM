$Python = "C:\Users\Govind\AppData\Local\Python\pythoncore-3.14-64\python.exe"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
& $Python server.py 8002
