import { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { analysisResults, summaryStats, fireBoundaries } from '../data/fireData';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ReportGenerator() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);

  const generateExcel = () => {
    setGenerating('excel');

    // Лист 1: Сводная информация
    const summaryData = [
      ['ЕЖЕНЕДЕЛЬНАЯ СВОДКА ПО ЛЕСНЫМ ПОЖАРАМ'],
      [`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`],
      [''],
      ['ОБЩАЯ СТАТИСТИКА'],
      ['Всего пожаров', summaryStats.totalFires],
      ['Активных пожаров', summaryStats.activeFires],
      ['Общая площадь пожаров, га', summaryStats.totalAreaBurned],
      ['Площадь пострадавшего леса, га', summaryStats.totalForestAffected],
      [''],
      ['СТАТИСТИКА ПО ПОРОДАМ'],
      ['Порода', 'Площадь, га', 'Доля, %'],
      ...summaryStats.speciesBreakdown.map(s => [s.species, s.area, s.percent]),
      [''],
      ['СТАТИСТИКА ПО ВОЗРАСТНЫМ ГРУППАМ'],
      ['Возрастная группа', 'Площадь, га', 'Доля, %'],
      ...summaryStats.ageBreakdown.map(a => [a.age_group, a.area, a.percent]),
    ];

    // Лист 2: Детальный анализ
    const detailData = [
      ['ДЕТАЛЬНЫЙ АНАЛИЗ ПЕРЕСЕЧЕНИЯ ПОЖАРОВ И ЛЕСНОГО ФОНДА'],
      [''],
      ['Выдел', 'Порода', 'Возрастная группа', 'Площадь горения, га', '% выдела', 'ID пожара'],
      ...analysisResults.map(r => [
        r.plot_id, r.species, r.age_group, r.area_burned_ha, r.percent_of_plot, r.fire_id
      ]),
      [''],
      ['ИТОГО', '', '', analysisResults.reduce((s, r) => s + r.area_burned_ha, 0).toFixed(1), '', ''],
    ];

    // Лист 3: Реестр пожаров
    const fireData = [
      ['РЕЕСТР ПОЖАРОВ'],
      [''],
      ['ID', 'Название', 'Площадь, га', 'Дата начала', 'Статус', 'Класс опасности'],
      ...fireBoundaries.map(f => [
        f.id, f.name, f.area_ha, f.start_date,
        f.status === 'active' ? 'Действующий' : f.status === 'contained' ? 'Локализован' : 'Ликвидирован',
        f.danger_class
      ]),
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    const ws3 = XLSX.utils.aoa_to_sheet(fireData);

    // Установка ширины колонок
    ws2['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 10 }, { wch: 12 }];
    ws3['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];

    XLSX.utils.book_append_sheet(wb, ws1, 'Сводка');
    XLSX.utils.book_append_sheet(wb, ws2, 'Анализ');
    XLSX.utils.book_append_sheet(wb, ws3, 'Реестр пожаров');

    XLSX.writeFile(wb, `ЛесПожар_Сводка_${new Date().toISOString().slice(0, 10)}.xlsx`);

    setTimeout(() => {
      setGenerating(null);
      setGenerated(prev => [...prev, 'excel']);
    }, 1500);
  };

  const generatePDF = () => {
    setGenerating('pdf');

    setTimeout(() => {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Заголовок
      doc.setFontSize(18);
      doc.setTextColor(22, 101, 52);
      doc.text('ЕЖЕНЕДЕЛЬНАЯ СВОДКА ПО ЛЕСНЫМ ПОЖАРАМ', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, 28, { align: 'center' });
      doc.text('Лесничество: Красноярское | Район: Берёзовский', pageWidth / 2, 33, { align: 'center' });

      // Статистика
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Общая статистика:', 15, 45);

      doc.setFontSize(9);
      doc.text(`Всего пожаров: ${summaryStats.totalFires} (активных: ${summaryStats.activeFires})`, 15, 52);
      doc.text(`Общая площадь: ${summaryStats.totalAreaBurned} га`, 15, 58);
      doc.text(`Пострадавший лес: ${summaryStats.totalForestAffected} га`, 15, 64);

      // Таблица анализа
      doc.autoTable({
        startY: 72,
        head: [['Выдел', 'Порода', 'Возраст. группа', 'Площадь, га', '% выдела', 'Пожар']],
        body: analysisResults.map(r => [
          r.plot_id, r.species, r.age_group,
          r.area_burned_ha.toFixed(1), `${r.percent_of_plot.toFixed(1)}%`, r.fire_id
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [22, 101, 52], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        theme: 'striped',
      });

      // Карта-схема (имитация)
      const mapY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Схема расположения пожаров:', 15, mapY);

      // Рисуем схематичную карту
      const mapX = 15;
      const mapW = 120;
      const mapH = 60;
      const mapRectY = mapY + 3;

      doc.setFillColor(240, 249, 255);
      doc.rect(mapX, mapRectY, mapW, mapH, 'F');
      doc.setDrawColor(200);
      doc.rect(mapX, mapRectY, mapW, mapH, 'S');

      // Лесные участки (зелёные квадраты)
      const plots = [
        { x: 25, y: mapRectY + 10, w: 20, h: 15, label: 'Сосна' },
        { x: 50, y: mapRectY + 8, w: 18, h: 18, label: 'Ель' },
        { x: 75, y: mapRectY + 12, w: 22, h: 14, label: 'Листв.' },
        { x: 35, y: mapRectY + 32, w: 25, h: 16, label: 'Кедр' },
        { x: 70, y: mapRectY + 35, w: 20, h: 15, label: 'Берёза' },
      ];

      plots.forEach(p => {
        doc.setFillColor(187, 247, 208);
        doc.setDrawColor(22, 101, 52);
        doc.rect(p.x, p.y, p.w, p.h, 'FD');
        doc.setFontSize(6);
        doc.setTextColor(22, 101, 52);
        doc.text(p.label, p.x + p.w / 2, p.y + p.h / 2, { align: 'center' });
      });

      // Пожары (красные круги)
      const fires = [
        { x: 35, y: mapRectY + 18, r: 8 },
        { x: 60, y: mapRectY + 15, r: 6 },
        { x: 85, y: mapRectY + 20, r: 5 },
      ];

      fires.forEach(f => {
        doc.setFillColor(239, 68, 68);
        doc.setDrawColor(185, 28, 28);
        doc.circle(f.x, f.y, f.r, 'FD');
        doc.setFontSize(5);
        doc.setTextColor(255);
        doc.text('FIRE', f.x, f.y + 1, { align: 'center' });
      });

      // Легенда карты
      doc.setFontSize(7);
      doc.setTextColor(0);
      const legX = mapX + mapW + 10;
      doc.text('Легенда:', legX, mapRectY + 5);
      doc.setFillColor(187, 247, 208);
      doc.rect(legX, mapRectY + 8, 8, 5, 'F');
      doc.text('Лесной фонд', legX + 10, mapRectY + 12);
      doc.setFillColor(239, 68, 68);
      doc.circle(legX + 4, mapRectY + 20, 3, 'F');
      doc.text('Пожары', legX + 10, mapRectY + 22);

      // Подвал
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Сформировано автоматически | Система ЛесПожар-Аналитика', pageWidth / 2, 200, { align: 'center' });

      doc.save(`ЛесПожар_Карта_${new Date().toISOString().slice(0, 10)}.pdf`);

      setGenerating(null);
      setGenerated(prev => [...prev, 'pdf']);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <span>📄</span> Генерация отчётов
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Автоматическое формирование еженедельной сводки для лесничего
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Excel */}
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-lg">
              📊
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-800">Excel-отчёт</div>
              <div className="text-xs text-gray-500">
                Сводка + детальный анализ + реестр пожаров (.xlsx)
              </div>
            </div>
          </div>
          <button
            onClick={generateExcel}
            disabled={generating !== null}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {generating === 'excel' ? (
              <>
                <span className="animate-spin">⏳</span> Генерация...
              </>
            ) : generated.includes('excel') ? (
              <>✅ Скачан</>
            ) : (
              <>📥 Скачать</>
            )}
          </button>
        </div>

        {/* PDF */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white text-lg">
              🗺️
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-800">PDF-карта</div>
              <div className="text-xs text-gray-500">
                Карта-схема + таблица анализа + статистика (.pdf)
              </div>
            </div>
          </div>
          <button
            onClick={generatePDF}
            disabled={generating !== null}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {generating === 'pdf' ? (
              <>
                <span className="animate-spin">⏳</span> Генерация...
              </>
            ) : generated.includes('pdf') ? (
              <>✅ Скачан</>
            ) : (
              <>📥 Скачать</>
            )}
          </button>
        </div>

        {/* Python-скрипт */}
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-mono">geopandas_analysis.py</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Python / GeoPandas</span>
          </div>
          <pre className="text-xs text-green-400 overflow-x-auto font-mono leading-relaxed">
{`import geopandas as gpd
import pandas as pd
import requests
from shapely.geometry import Polygon

# 1. Скачиваем границы пожаров (ИСДМ-Рослесхоз)
fires_url = "https://api.isdm-rosleshoz.ru/fires/active"
fires_response = requests.get(fires_url)
fires_gdf = gpd.GeoDataFrame.from_features(
    fires_response.json()['features'], crs="EPSG:4326"
)

# 2. Загружаем базу лесного фонда
forest = gpd.read_file("forest_fund.gpkg")

# 3. Пространственное пересечение
intersection = gpd.overlay(fires_gdf, forest, how='intersection')

# 4. Расчёт площадей
intersection['area_ha'] = intersection.geometry.area / 10000

# 5. Группировка по породе и возрасту
summary = intersection.groupby(
    ['species', 'age_group']
)['area_ha'].sum().reset_index()

# 6. Экспорт в Excel
summary.to_excel("weekly_report.xlsx")

# 7. Генерация PDF-карты
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(12, 8))
forest.plot(ax=ax, color='lightgreen', edgecolor='darkgreen')
fires_gdf.plot(ax=ax, color='red', alpha=0.5)
intersection.plot(ax=ax, color='orange', alpha=0.7)
plt.title("Лесные пожары - Еженедельная сводка")
plt.savefig("fire_map.pdf", bbox_inches='tight')`}
          </pre>
        </div>
      </div>
    </div>
  );
}
