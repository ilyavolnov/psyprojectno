#!/usr/bin/env python3

# Считываем ID из базы данных
with open('/tmp/sorted_db_ids.txt', 'r') as f:
    db_ids = set(int(line.strip()) for line in f if line.strip())

# Считываем существующие файлы
with open('/tmp/sorted_existing.txt', 'r') as f:
    file_ids = set(int(line.strip()) for line in f if line.strip())

# Находим отсутствующие
missing_ids = db_ids - file_ids

print("Отсутствующие ID изображений:")
for missing_id in sorted(missing_ids):
    print(missing_id)