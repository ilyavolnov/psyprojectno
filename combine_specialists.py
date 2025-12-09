import os

def combine_specialists_data():
    """Объединяет данные всех специалистов в один файл"""
    
    # Создаем итоговый файл
    with open('specialiststext.txt', 'w', encoding='utf-8') as output_file:
        output_file.write("ДАННЫЕ ВСЕХ СПЕЦИАЛИСТОВ\n")
        output_file.write("=" * 100 + "\n\n")
        
        # Список файлов специалистов
        specialist_files = sorted([f for f in os.listdir('specialists_data') if f.startswith('specialist_') and f.endswith('.txt')])
        
        for filename in specialist_files:
            filepath = os.path.join('specialists_data', filename)
            
            with open(filepath, 'r', encoding='utf-8') as input_file:
                content = input_file.read()
                output_file.write(content)
                output_file.write("\n" + "-" * 100 + "\n\n")
    
    print(f"Создан объединенный файл 'specialiststext.txt' с информацией о {len(specialist_files)} специалистах")

if __name__ == "__main__":
    combine_specialists_data()