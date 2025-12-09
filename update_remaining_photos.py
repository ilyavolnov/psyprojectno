import sqlite3
import shutil
import os

# Подключаемся к базе данных
conn = sqlite3.connect('backend/database.sqlite')
cursor = conn.cursor()

# Определяем соответствия для оставшихся специалистов
# Загружаем все оставшиеся имена специалистов
cursor.execute("SELECT id, name FROM specialists WHERE photo LIKE '%hero-page.webp%' OR photo LIKE '%olga_1.jpeg%' OR photo LIKE '%margarita_m.jpg%' OR photo LIKE '%anna_b.jpg%'")
remaining_specialists = cursor.fetchall()

# Нужно определить соответствие для следующих специалистов:
# 69: Надежда
# 72: Елена
# 73: Мария
# 85: Екатерина
# 88: Анна
# 90: Юлия

# Словарь с соответствиями имен к файлам в папке specialists_data/images
name_to_file = {
    "Надежда": "22_надежда.jpg",
    "Елена": "25_елена.jpg",
    "Мария": "26_мария.jpg",
    "Екатерина": "38_екатерина.jpg",
    "Анна": "41_анна.jpg",
    "Юлия": "43_юлия.jpg"
}

# Обновляем изображения для каждого из этих специалистов
for spec_id, spec_name in remaining_specialists:
    if spec_name in name_to_file:
        img_filename = name_to_file[spec_name]
        new_filename = f"specialist_{spec_id}.jpg"
        
        source_path = f"specialists_data/images/{img_filename}"
        dest_path = f"images/specialists/{new_filename}"
        
        if os.path.exists(source_path):
            # Копируем изображение
            shutil.copy2(source_path, dest_path)
            
            # Обновляем запись в базе данных
            cursor.execute("UPDATE specialists SET photo = ? WHERE id = ?", 
                          (f"images/specialists/{new_filename}", spec_id))
            print(f"Обновлено: {spec_name} (ID: {spec_id}) -> {new_filename}")
        else:
            print(f"Файл не найден для {spec_name}: {source_path}")
    else:
        print(f"Нет соответствия для: {spec_name}")

conn.commit()
conn.close()

print("Процесс обновления завершен!")