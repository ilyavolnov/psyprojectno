import os
import shutil
import sqlite3

def update_specialist_photos():
    """Обновляет изображения специалистов в базе данных и копирует правильные изображения"""
    
    # Подключаемся к базе данных
    conn = sqlite3.connect('backend/database.sqlite')
    cursor = conn.cursor()
    
    # Сопоставление имен специалистов с файлами изображений
    photo_mapping = {
        'Маргарита Румянцева': '02_маргарита_румянцева.jpg',
        'Александра': '03_александра.jpg',
        'Оксана': '04_оксана.jpg',
        'Валерия': '05_валерия.jpg',
        'Анастасия': '06_анастасия.jpg',  # Это должна быть другая Анастасия, уточним ниже
        'Ольга П.': '07_ольга_п_.jpg',
        'Анна Б.': '08_анна_б_.jpg',
        'Анастасия Б.': '09_анастасия_б_.jpg',
        'Марина': '10_марина.jpg',
        'Ольга': '11_ольга.jpg',
        'Ульяна': '12_ульяна.jpg',
        'Юлия С.': '13_юлия_с_.jpg',
        'Павел': '14_павел.jpg',
        'Владимир': '15_владимир.jpg',
        'Мария Р.': '16_мария_р_.jpg',
        'Вера': '17_вера.jpg',
        'Марина М.': '18_марина_м_.jpg',
        'Анна Ж.': '19_анна_ж_.jpg',
        'Наталья': '20_наталья.jpg',
        'Надежда Л.': '21_надежда_л_.jpg',
        'Надежда': '22_надежда.jpg',
        'Элеонора': '23_элеонора.jpg',
        'Елена К.': '24_елена_к_.jpg',
        'Елена': '25_елена.jpg',
        'Мария': '26_мария.jpg',
        'Елена Ч.': '27_елена_ч_.jpg',
        'Инесса': '28_инесса.jpg',
        'Наталья Г.': '29_наталья_г_.jpg',
        'Елизавета': '30_елизавета.jpg',
        'Мария С.': '31_мария_с_.jpg',
        'Наталья С.': '32_наталья_с_.jpg',
        'Анна С.': '33_анна_с_.jpg',
        'Наталья Я.': '34_наталья_я_.jpg',
        'Наталья Ш.': '35_наталья_ш_.jpg',
        'Екатерина М.': '37_екатерина_м_.jpg',
        'Екатерина': '38_екатерина.jpg',
        'Динара': '39_динара.jpg',
        'Елена В.': '40_елена_в_.jpg',
        'Анна': '41_анна.jpg',
        'Евгения': '42_евгения.jpg',
        'Юлия': '43_юлия.jpg',
        'Анастасия П.': '44_анастасия_п_.jpg',
        'Татьяна': '45_татьяна.jpg'
    }
    
    # Создаем папку для изображений, если её нет
    os.makedirs('images/specialists', exist_ok=True)
    
    # Копируем все изображения в основную папку с новыми именами
    updated_count = 0
    
    for spec_name, img_filename in photo_mapping.items():
        # Ищем ID специалиста по имени
        cursor.execute("SELECT id FROM specialists WHERE name LIKE ?", (f'%{spec_name}%',))
        result = cursor.fetchone()
        
        if result:
            spec_id = result[0]
            
            # Определяем новое имя файла на основе ID
            new_filename = f"specialist_{spec_id}.jpg"
            
            # Копируем изображение
            source_path = f"specialists_data/images/{img_filename}"
            dest_path = f"images/specialists/{new_filename}"
            
            if os.path.exists(source_path):
                shutil.copy2(source_path, dest_path)
                
                # Обновляем запись в базе данных
                cursor.execute("UPDATE specialists SET photo = ? WHERE id = ?", 
                              (f"images/specialists/{new_filename}", spec_id))
                print(f"Обновлено: {spec_name} (ID: {spec_id}) -> {new_filename}")
                updated_count += 1
            else:
                print(f"Файл не найден: {source_path}")
        else:
            print(f"Специалист не найден: {spec_name}")
    
    # Обработка оставшихся специалистов (например, "Семейная сессия в 4 руки")
    remaining_mappings = {
        'Семейная сессия в 4 руки': '36_семейная_сессия_в_4_руки.jpg'
    }
    
    for spec_name, img_filename in remaining_mappings.items():
        cursor.execute("SELECT id FROM specialists WHERE name LIKE ?", (f'%{spec_name}%',))
        result = cursor.fetchone()
        
        if result:
            spec_id = result[0]
            new_filename = f"specialist_{spec_id}.jpg"
            
            source_path = f"specialists_data/images/{img_filename}"
            dest_path = f"images/specialists/{new_filename}"
            
            if os.path.exists(source_path):
                shutil.copy2(source_path, dest_path)
                
                cursor.execute("UPDATE specialists SET photo = ? WHERE id = ?", 
                              (f"images/specialists/{new_filename}", spec_id))
                print(f"Обновлено: {spec_name} (ID: {spec_id}) -> {new_filename}")
                updated_count += 1
    
    # Сохраняем изменения в базе данных
    conn.commit()
    conn.close()
    
    print(f"\nОбновлено изображений для {updated_count} специалистов")
    
    # Для оставшихся специалистов без изображений устанавливаем стандартное изображение
    print("\nПроверка оставшихся записей...")
    conn = sqlite3.connect('backend/database.sqlite')
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM specialists WHERE photo LIKE '%hero-page.webp%'")
    count_with_default = cursor.fetchone()[0]
    print(f"Количество специалистов с дефолтным изображением: {count_with_default}")
    
    conn.close()

if __name__ == "__main__":
    update_specialist_photos()