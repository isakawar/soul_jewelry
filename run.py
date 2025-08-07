#!/usr/bin/env python3
"""
Скрипт для запуску Soul Jewelry додатку
"""

import os
import sys
import subprocess

def install_requirements():
    """Встановлення залежностей"""
    print("📦 Встановлення залежностей...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Залежності встановлені успішно!")
    except subprocess.CalledProcessError:
        print("❌ Помилка встановлення залежностей")
        return False
    return True

def run_app():
    """Запуск додатку"""
    print("🚀 Запуск Soul Jewelry додатку...")
    print("🌐 Відкрийте http://localhost:8000 у вашому браузері")
    print("⏹️  Для зупинки натисніть Ctrl+C")
    print("-" * 50)
    
    try:
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n👋 Додаток зупинено")

if __name__ == "__main__":
    print("💎 Soul Jewelry - Інтернет-магазин прикрас")
    print("=" * 50)
    
    if install_requirements():
        run_app()
    else:
        print("❌ Неможливо запустити додаток")
        sys.exit(1) 