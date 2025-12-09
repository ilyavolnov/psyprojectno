import requests
from bs4 import BeautifulSoup
import os
import time
from urllib.parse import urljoin, urlparse

def create_folder_if_exists(folder_path):
    """Создает папку, если она не существует"""
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

def download_image(img_url, folder_path, filename):
    """Скачивает изображение и сохраняет в указанной папке"""
    try:
        response = requests.get(img_url, stream=True)
        response.raise_for_status()

        filepath = os.path.join(folder_path, filename)
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"   Изображение скачано: {filename}")
        return True
    except Exception as e:
        print(f"   Ошибка при скачивании {img_url}: {e}")
        return False

def get_specialists_data():
    """Получает список специалистов с сайта"""
    url = 'https://dr-rumyantceva.ru/specialists/'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Создаем папки для сохранения
        create_folder_if_exists('specialists_data')
        create_folder_if_exists('specialists_data/images')
        
        # Ищем карточки специалистов
        specialists = []
        specialist_items = soup.find_all('div', class_='specialistsPage__item')

        # Счетчик для именования файлов
        counter = 1

        for item in specialist_items:
            try:
                # Имя специалиста
                name_elem = item.find('a', class_='specialistsPage__itemTitle')
                name = name_elem.text.strip() if name_elem else 'Без имени'

                # Ссылка на страницу специалиста
                link_elem = item.find('a', class_='specialistsPage__itemTitle') or item.find('a', class_='btn')
                if link_elem:
                    page_url = link_elem.get('href')
                    if not page_url.startswith('http'):
                        page_url = urljoin(url, page_url)
                    print(f"Обработка: {name}")

                    # Ищем изображение
                    img_elem = item.find('a', class_='specialistsPage__itemImg')
                    img_url = None
                    if img_elem:
                        # Ищем изображение внутри ссылки
                        img_tag = img_elem.find('img')
                        if img_tag:
                            img_url = img_tag.get('data-src') or img_tag.get('src') or img_tag.get('data-lazy-src')
                            if img_url and not img_url.startswith('http'):
                                img_url = urljoin(url, img_url)
                    
                    # Получаем подробную информацию со страницы специалиста
                    specialist_details = get_specialist_details(page_url, headers)
                    
                    # Формируем имя файла для изображения
                    filename = f"{counter:02d}_{name.lower().replace(' ', '_').replace('.', '_')}.jpg"
                    
                    # Скачиваем изображение, если оно есть
                    if img_url:
                        download_image(img_url, 'specialists_data/images', filename)
                    
                    # Сохраняем информацию в текстовый файл
                    specialist_info = {
                        'id': counter,
                        'name': name,
                        'url': page_url,
                        'photo_url': img_url,
                        'photo_filename': filename if img_url else None,
                        'details': specialist_details
                    }
                    
                    specialists.append(specialist_info)
                    
                    # Сохраняем данные в текстовый файл
                    save_specialist_to_file(specialist_info, counter)
                    
                    counter += 1
                    
                    # Задержка между запросами, чтобы не перегружать сервер
                    time.sleep(1)
                    
            except Exception as e:
                print(f"Ошибка при обработке карточки: {e}")
                continue
        
        # Сохраняем общий файл со списком всех специалистов
        save_all_specialists_list(specialists)
        
        print(f"\nОбработка завершена! Найдено {len(specialists)} специалистов")
        
    except Exception as e:
        print(f"Ошибка при получении списка специалистов: {e}")

def get_specialist_details(url, headers):
    """Получает детальную информацию со страницы специалиста"""
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Ищем содержимое страницы
        content = soup.find('main') or soup.find('div', class_='specialist-profile') or soup.find('div', class_='content')
        
        if content:
            # Удаляем ненужные элементы (например, навигацию, рекламу)
            for unwanted in content(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                unwanted.decompose()
            
            # Получаем текстовое содержимое
            text_content = content.get_text(separator='\\n', strip=True)
        else:
            text_content = "Содержимое не найдено"
        
        return text_content
        
    except Exception as e:
        print(f"Ошибка при получении деталей со страницы {url}: {e}")
        return "Ошибка загрузки содержимого"

def save_specialist_to_file(specialist_info, index):
    """Сохраняет информацию о специалисте в текстовый файл"""
    filename = f"specialists_data/specialist_{index:02d}.txt"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"ID: {specialist_info['id']}\\n")
        f.write(f"Имя: {specialist_info['name']}\\n")
        f.write(f"URL: {specialist_info['url']}\\n")
        f.write(f"Фото URL: {specialist_info['photo_url']}\\n")
        f.write(f"Фото файл: {specialist_info['photo_filename']}\\n")
        f.write("="*80 + "\\n")
        f.write("Детали: \\n")
        f.write(specialist_info['details'])
        f.write("\\n" + "="*80 + "\\n")
    
    print(f"   Файл сохранен: {filename}")

def save_all_specialists_list(specialists):
    """Сохраняет общий список всех специалистов в один файл"""
    filename = "specialists_data/specialists_list.txt"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("Список всех специалистов\\n")
        f.write("="*80 + "\\n\\n")
        
        for spec in specialists:
            f.write(f"{spec['id']:02d}. {spec['name']}\\n")
            f.write(f"   URL: {spec['url']}\\n")
            f.write(f"   Фото: {spec['photo_url']}\\n")
            f.write(f"   Файл: {spec['photo_filename']}\\n")
            f.write("\\n")
    
    print(f"   Общий список сохранен: {filename}")

if __name__ == "__main__":
    print("Начинаю сбор данных со страницы специалистов...")
    print("Сайт: https://dr-rumyantceva.ru/specialists/")
    print()
    
    get_specialists_data()
    
    print("\\nВсе готово! Файлы сохранены в папку 'specialists_data':")
    print("- specialists_list.txt - общий список всех специалистов")
    print("- specialist_XX.txt - детали каждого специалиста")
    print("- images/ - папка с изображениями")