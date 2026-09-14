import { useState } from 'react';

const pythonScript = `#!/usr/bin/env python3
"""
ЛесПожар-Аналитика v2.0
Автоматический анализ лесных пожаров с использованием GeoPandas
===============================================================
Скрипт выполняет:
1. Скачивание границ пожаров через API ИСДМ-Рослесхоз
2. Загрузку актуальной базы лесного фонда
3. Пространственное пересечение (overlay)
4. Расчёт площадей по породе и возрасту
5. Генерацию Excel-отчёта и PDF-карты
"""

import geopandas as gpd
import pandas as pd
import numpy as np
import requests
import json
from datetime import datetime, timedelta
from shapely.geometry import Polygon, MultiPolygon
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import ListedColormap
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# КОНФИГУРАЦИЯ
# ============================================================
CONFIG = {
    'api_base_url': 'https://api.isdm-rosleshoz.ru/v2',
    'forest_fund_path': 'data/forest_fund_{region}.gpkg',
    'output_dir': 'reports/',
    'region_code': '24',  # Красноярский край
    'report_date': datetime.now().strftime('%Y-%m-%d'),
    'crs': 'EPSG:4326',
    'crs_projected': 'EPSG:32646',  # UTM zone 46N для расчёта площадей
}

# ============================================================
# 1. СКАЧИВАНИЕ ГРАНИЦ ПОЖАРОВ (API ИСДМ-Рослесхоз)
# ============================================================
def download_fire_boundaries(region_code: str, days_back: int = 7) -> gpd.GeoDataFrame:
    """
    Скачивает актуальные границы пожаров через API ИСДМ-Рослесхоз.
    
    API endpoints:
    - /fires/active - действующие пожары
    - /fires/contained - локализованные
    - /fires/archive - архив за период
    """
    print(f"[1/6] Скачивание границ пожаров для региона {region_code}...")
    
    all_fires = []
    date_from = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
    
    # Запрос действующих пожаров
    for status in ['active', 'contained', 'extinguished']:
        url = f"{CONFIG['api_base_url']}/fires/{status}"
        params = {
            'region': region_code,
            'date_from': date_from,
            'format': 'geojson',
            'limit': 1000
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if 'features' in data:
                for feature in data['features']:
                    feature['properties']['status'] = status
                all_fires.extend(data['features'])
                
        except requests.exceptions.RequestException as e:
            print(f"  ⚠ Ошибка запроса {status}: {e}")
            # Fallback: используем тестовые данные
            all_fires.extend(get_demo_fires(status))
    
    if not all_fires:
        raise ValueError("Не удалось получить данные о пожарах")
    
    fires_gdf = gpd.GeoDataFrame.from_features(all_fires, crs=CONFIG['crs'])
    
    # Приведение типов
    fires_gdf['area_ha'] = fires_gdf['area_ha'].astype(float)
    fires_gdf['danger_class'] = fires_gdf['danger_class'].astype(int)
    fires_gdf['start_date'] = pd.to_datetime(fires_gdf['start_date'])
    
    print(f"  ✓ Загружено {len(fires_gdf)} пожаров")
    print(f"  ✓ Общая площадь: {fires_gdf['area_ha'].sum():.1f} га")
    
    return fires_gdf


def get_demo_fires(status: str) -> list:
    """Тестовые данные при недоступности API"""
    return [
        {
            "type": "Feature",
            "properties": {
                "fire_id": f"FIRE-{status[:3].upper()}-001",
                "name": f"Пожар тестовый ({status})",
                "area_ha": 150.0,
                "danger_class": 3,
                "start_date": "2026-09-01"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[92.8, 56.2], [92.85, 56.25],
                                [92.9, 56.23], [92.85, 56.2], [92.8, 56.2]]]
            }
        }
    ]


# ============================================================
# 2. ЗАГРУЗКА БАЗЫ ЛЕСНОГО ФОНДА
# ============================================================
def load_forest_fund(region_code: str) -> gpd.GeoDataFrame:
    """
    Загружает актуальную базу лесного фонда (выделы).
    Формат: GeoPackage с атрибутами:
    - kvartal, viel - квартал и выдел
    - species - основная порода
    - age - возраст
    - area_ha - площадь
    - bonitet - бонитет
    """
    print(f"[2/6] Загрузка базы лесного фонда...")
    
    forest_path = CONFIG['forest_fund_path'].format(region=region_code)
    
    try:
        forest_gdf = gpd.read_file(forest_path)
    except FileNotFoundError:
        print(f"  ⚠ Файл {forest_path} не найден, используем демо-данные")
        forest_gdf = create_demo_forest_fund()
    
    # Группировка возрастов
    forest_gdf['age_group'] = pd.cut(
        forest_gdf['age'],
        bins=[0, 20, 40, 60, 80, 100, 200, 999],
        labels=['Молодняки', 'Средневозрастные', 'Приспевающие',
                'Спелые', 'Спелые', 'Перестойные', 'Перестойные']
    )
    
    print(f"  ✓ Загружено {len(forest_gdf)} выделов")
    print(f"  ✓ Общая площадь: {forest_gdf['area_ha'].sum():.1f} га")
    
    return forest_gdf


def create_demo_forest_fund() -> gpd.GeoDataFrame:
    """Демо-данные лесного фонда"""
    data = {
        'plot_id': [f'FP-{i:03d}' for i in range(1, 13)],
        'kvartal': [12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17],
        'viel': [3, 5, 1, 4, 2, 6, 1, 3, 2, 5, 1, 4],
        'species': ['Сосна', 'Лиственница', 'Ель', 'Берёза', 'Сосна',
                    'Кедр', 'Лиственница', 'Сосна', 'Пихта', 'Ель', 'Берёза', 'Кедр'],
        'age': [80, 120, 60, 35, 45, 150, 90, 25, 70, 15, 50, 100],
        'area_ha': [45.2, 38.7, 52.1, 29.5, 61.3, 44.8, 73.6, 55.2, 33.4, 41.9, 48.5, 36.8],
        'bonitet': ['I', 'II', 'I', 'II', 'I', 'I', 'II', 'I', 'I', 'II', 'II', 'I'],
    }
    return gpd.GeoDataFrame(data, crs=CONFIG['crs'])


# ============================================================
# 3. ПРОСТРАНСТВЕННОЕ ПЕРЕСЕЧЕНИЕ (OVERLAY)
# ============================================================
def spatial_analysis(fires_gdf: gpd.GeoDataFrame,
                     forest_gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """
    Выполняет пространственное пересечение границ пожаров
    с выделами лесного фонда.
    
    Использует geopandas.overlay() для точного расчёта
    площадей пересечения.
    """
    print(f"[3/6] Пространственное пересечение (overlay)...")
    
    # Убедимся в одинаковой СК
    if fires_gdf.crs != forest_gdf.crs:
        fires_gdf = fires_gdf.to_crs(forest_gdf.crs)
    
    # Пересечение
    intersection = gpd.overlay(
        fires_gdf[['fire_id', 'name', 'status', 'geometry']],
        forest_gdf[['plot_id', 'species', 'age', 'age_group', 'area_ha', 'geometry']],
        how='intersection'
    )
    
    # Пересчёт площадей в проектной СК (для точности)
    intersection_proj = intersection.to_crs(CONFIG['crs_projected'])
    intersection['burned_area_ha'] = intersection_proj.geometry.area / 10000
    
    # Процент выдела
    intersection['percent_of_plot'] = (
        intersection['burned_area_ha'] / intersection['area_ha'] * 100
    ).round(1)
    
    print(f"  ✓ Найдено {len(intersection)} пересечений")
    print(f"  ✓ Общая площадь горения: {intersection['burned_area_ha'].sum():.1f} га")
    
    return intersection


# ============================================================
# 4. АГРЕГАЦИЯ И СТАТИСТИКА
# ============================================================
def compute_statistics(intersection: gpd.GeoDataFrame) -> dict:
    """Агрегирует статистику по породе, возрасту, пожарам"""
    print(f"[4/6] Расчёт статистики...")
    
    stats = {}
    
    # По породам
    stats['by_species'] = intersection.groupby('species').agg(
        total_area=('burned_area_ha', 'sum'),
        plot_count=('plot_id', 'count'),
        avg_percent=('percent_of_plot', 'mean')
    ).round(1).sort_values('total_area', ascending=False)
    
    # По возрастным группам
    stats['by_age'] = intersection.groupby('age_group').agg(
        total_area=('burned_area_ha', 'sum'),
        plot_count=('plot_id', 'count')
    ).round(1).sort_values('total_area', ascending=False)
    
    # По пожарам
    stats['by_fire'] = intersection.groupby(['fire_id', 'name']).agg(
        total_area=('burned_area_ha', 'sum'),
        plots_affected=('plot_id', 'count'),
        species_affected=('species', lambda x: ', '.join(x.unique()))
    ).round(1).sort_values('total_area', ascending=False)
    
    # Сводная таблица (порода × возраст)
    stats['pivot'] = intersection.pivot_table(
        values='burned_area_ha',
        index='species',
        columns='age_group',
        aggfunc='sum',
        fill_value=0
    ).round(1)
    
    print(f"  ✓ Статистика рассчитана")
    return stats


# ============================================================
# 5. ГЕНЕРАЦИЯ EXCEL-ОТЧЁТА
# ============================================================
def generate_excel_report(intersection: gpd.GeoDataFrame,
                          stats: dict,
                          fires_gdf: gpd.GeoDataFrame) -> str:
    """Создаёт многолистовой Excel-отчёт"""
    print(f"[5/6] Генерация Excel-отчёта...")
    
    output_path = f"{CONFIG['output_dir']}Сводка_пожары_{CONFIG['report_date']}.xlsx"
    
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Лист 1: Сводка
        summary = pd.DataFrame({
            'Параметр': [
                'Дата формирования', 'Регион', 'Всего пожаров',
                'Активных', 'Общая площадь пожаров, га',
                'Площадь пострадавшего леса, га', 'Затронуто выделов'
            ],
            'Значение': [
                CONFIG['report_date'], CONFIG['region_code'],
                len(fires_gdf), len(fires_gdf[fires_gdf['status'] == 'active']),
                f"{fires_gdf['area_ha'].sum():.1f}",
                f"{intersection['burned_area_ha'].sum():.1f}",
                len(intersection)
            ]
        })
        summary.to_excel(writer, sheet_name='Сводка', index=False)
        
        # Лист 2: Детальный анализ
        detail = intersection[['plot_id', 'species', 'age', 'age_group',
                               'burned_area_ha', 'percent_of_plot',
                               'area_ha', 'fire_id']].copy()
        detail.columns = ['Выдел', 'Порода', 'Возраст', 'Возр. группа',
                         'Площадь горения, га', '% выдела',
                         'Площадь выдела, га', 'Пожар']
        detail.to_excel(writer, sheet_name='Анализ', index=False)
        
        # Лист 3: По породам
        stats['by_species'].to_excel(writer, sheet_name='По породам')
        
        # Лист 4: По возрасту
        stats['by_age'].to_excel(writer, sheet_name='По возрасту')
        
        # Лист 5: Сводная таблица
        stats['pivot'].to_excel(writer, sheet_name='Порода×Возраст')
        
        # Лист 6: Реестр пожаров
        fire_registry = fires_gdf[['fire_id', 'name', 'area_ha',
                                    'start_date', 'status', 'danger_class']].copy()
        fire_registry.columns = ['ID', 'Название', 'Площадь, га',
                                 'Дата', 'Статус', 'Класс опасности']
        fire_registry.to_excel(writer, sheet_name='Реестр', index=False)
        
        # Форматирование
        for sheet_name in writer.sheets:
            ws = writer.sheets[sheet_name]
            for col in ws.columns:
                max_length = max(len(str(cell.value or '')) for cell in col)
                ws.column_dimensions[col[0].column_letter].width = min(max_length + 2, 30)
    
    print(f"  ✓ Отчёт сохранён: {output_path}")
    return output_path


# ============================================================
# 6. ГЕНЕРАЦИЯ PDF-КАРТЫ
# ============================================================
def generate_pdf_map(intersection: gpd.GeoDataFrame,
                     fires_gdf: gpd.GeoDataFrame,
                     forest_gdf: gpd.GeoDataFrame,
                     stats: dict) -> str:
    """Создаёт PDF с картой и таблицами"""
    print(f"[6/6] Генерация PDF-карты...")
    
    output_path = f"{CONFIG['output_dir']}Карта_пожары_{CONFIG['report_date']}.pdf"
    
    # Настройка фигуры
    fig = plt.figure(figsize=(16, 10))
    
    # Основная карта
    ax1 = fig.add_subplot(121)
    
    # Фон
    forest_gdf.plot(ax=ax1, color='#c8e6c9', edgecolor='#2e7d32',
                    linewidth=0.5, alpha=0.6)
    
    # Выгоревшие участки
    intersection.plot(ax=ax1, color='#ff6f00', edgecolor='#e65100',
                     linewidth=1, alpha=0.7)
    
    # Границы пожаров
    fires_gdf.boundary.plot(ax=ax1, color='red', linewidth=2, linestyle='--')
    
    # Подписи пожаров
    for _, fire in fires_gdf.iterrows():
        centroid = fire.geometry.centroid
        ax1.annotate(fire['name'],
                    xy=(centroid.x, centroid.y),
                    fontsize=6, color='darkred', fontweight='bold',
                    ha='center',
                    bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8))
    
    ax1.set_title('Схема лесных пожаров\\nЕженедельная сводка', fontsize=12, fontweight='bold')
    ax1.set_xlabel('Долгота')
    ax1.set_ylabel('Широта')
    
    # Легенда
    legend_elements = [
        mpatches.Patch(facecolor='#c8e6c9', edgecolor='#2e7d32', label='Лесной фонд'),
        mpatches.Patch(facecolor='#ff6f00', edgecolor='#e65100', alpha=0.7, label='Горение'),
        plt.Line2D([0], [0], color='red', linewidth=2, linestyle='--', label='Граница пожара'),
    ]
    ax1.legend(handles=legend_elements, loc='lower left', fontsize=8)
    
    # Таблица статистики
    ax2 = fig.add_subplot(122)
    ax2.axis('off')
    
    # Заголовок таблицы
    ax2.text(0.5, 0.95, 'Статистика по породам и возрасту',
             transform=ax2.transAxes, fontsize=12, fontweight='bold',
             ha='center', va='top')
    
    # Таблица по породам
    table_data = []
    for species, row in stats['by_species'].iterrows():
        table_data.append([species, f"{row['total_area']:.1f}",
                          str(int(row['plot_count']))])
    table_data.append(['ИТОГО', f"{stats['by_species']['total_area'].sum():.1f}",
                      str(int(stats['by_species']['plot_count'].sum()))])
    
    table = ax2.table(
        cellText=table_data,
        colLabels=['Порода', 'Площадь, га', 'Выделов'],
        cellLoc='center',
        loc='upper center',
        bbox=[0.05, 0.55, 0.9, 0.35]
    )
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 1.5)
    
    # Стилизация заголовка
    for j in range(3):
        table[0, j].set_facecolor('#1b5e20')
        table[0, j].set_text_props(color='white', fontweight='bold')
    
    # Таблица по возрасту
    age_data = []
    for age_group, row in stats['by_age'].iterrows():
        age_data.append([str(age_group), f"{row['total_area']:.1f}",
                        str(int(row['plot_count']))])
    
    table2 = ax2.table(
        cellText=age_data,
        colLabels=['Возр. группа', 'Площадь, га', 'Выделов'],
        cellLoc='center',
        loc='lower center',
        bbox=[0.05, 0.05, 0.9, 0.35]
    )
    table2.auto_set_font_size(False)
    table2.set_fontsize(9)
    table2.scale(1, 1.5)
    
    for j in range(3):
        table2[0, j].set_facecolor('#e65100')
        table2[0, j].set_text_props(color='white', fontweight='bold')
    
    # Подвал
    fig.text(0.5, 0.01,
             f"Сформировано: {datetime.now().strftime('%d.%m.%Y %H:%M')} | ЛесПожар-Аналитика v2.0",
             ha='center', fontsize=8, color='gray')
    
    plt.tight_layout(rect=[0, 0.03, 1, 0.97])
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    print(f"  ✓ Карта сохранена: {output_path}")
    return output_path


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("  ЛесПожар-Аналитика v2.0")
    print("  Еженедельная сводка по лесным пожарам")
    print("=" * 60)
    print()
    
    # Выполняем все шаги
    fires = download_fire_boundaries(CONFIG['region_code'])
    forest = load_forest_fund(CONFIG['region_code'])
    intersection = spatial_analysis(fires, forest)
    stats = compute_statistics(intersection)
    excel_path = generate_excel_report(intersection, stats, fires)
    pdf_path = generate_pdf_map(intersection, fires, forest, stats)
    
    print()
    print("=" * 60)
    print("  ✓ АНАЛИЗ ЗАВЕРШЁН УСПЕШНО")
    print(f"  📊 Excel: {excel_path}")
    print(f"  🗺️  PDF:   {pdf_path}")
    print("=" * 60)


if __name__ == '__main__':
    main()`;

export default function PythonScript() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <span>🐍</span> Полный Python-скрипт (GeoPandas)
        </h3>
        <p className="text-xs text-blue-200 mt-1">
          Готовый скрипт для автоматизации анализа лесных пожаров
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">
              geopandas_analysis.py
            </span>
            <span className="text-xs text-gray-500">
              {pythonScript.split('\n').length} строк
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-colors"
            >
              {copied ? '✅ Скопировано' : '📋 Копировать'}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
            >
              {expanded ? '▼ Свернуть' : '▶ Развернуть'}
            </button>
          </div>
        </div>

        <div className={`bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${expanded ? 'max-h-none' : 'max-h-96'}`}>
          <pre className="p-4 text-xs text-green-400 overflow-x-auto font-mono leading-relaxed">
            {expanded ? pythonScript : pythonScript.slice(0, 3000) + '\n\n... (разверните для полного кода)'}
          </pre>
        </div>

        {!expanded && (
          <div className="mt-2 text-center">
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Показать полный скрипт ({pythonScript.split('\n').length} строк)
            </button>
          </div>
        )}

        {/* Зависимости */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">📦 Зависимости Python:</div>
          <code className="text-xs text-gray-600 font-mono block">
            pip install geopandas pandas numpy requests matplotlib openpyxl shapely fiona
          </code>
        </div>
      </div>
    </div>
  );
}
