import { useState } from 'react';
import MapView from './components/MapView';
import DataTable from './components/DataTable';
import ReportGenerator from './components/ReportGenerator';
import PythonScript from './components/PythonScript';

type Tab = 'map' | 'data' | 'reports' | 'script';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center text-xl">
                🌲
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ЛесПожар-Аналитика</h1>
                <p className="text-xs text-emerald-200">
                  Геопространственный анализ лесных пожаров | GeoPandas + ИСДМ-Рослесхоз
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-emerald-200">Обновлено</div>
                <div className="text-sm font-medium">{new Date().toLocaleDateString('ru-RU')}</div>
              </div>
              <div className="w-px h-8 bg-emerald-600"></div>
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-400/30">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-red-100">3 активных пожара</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <TabButton
              active={activeTab === 'map'}
              onClick={() => setActiveTab('map')}
              icon="🗺️"
              label="Карта"
            />
            <TabButton
              active={activeTab === 'data'}
              onClick={() => setActiveTab('data')}
              icon="📊"
              label="Анализ"
            />
            <TabButton
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
              icon="📄"
              label="Отчёты"
            />
            <TabButton
              active={activeTab === 'script'}
              onClick={() => setActiveTab('script')}
              icon="🐍"
              label="Python-скрипт"
            />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm flex items-center gap-2">
                    <span>🗺️</span> Интерактивная карта пожаров
                  </h2>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Границы пожаров (ИСДМ) + выделы лесного фонда
                  </p>
                </div>
                <div className="text-xs bg-white/20 px-2 py-1 rounded">
                  Красноярский край
                </div>
              </div>
              <div className="h-[500px] p-2">
                <MapView />
              </div>
            </div>

            {/* Быстрая сводка под картой */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickStat icon="🔥" label="Действующих" value="3" color="text-red-600" bg="bg-red-50" />
              <QuickStat icon="🟡" label="Локализовано" value="1" color="text-amber-600" bg="bg-amber-50" />
              <QuickStat icon="✅" label="Ликвидировано" value="1" color="text-green-600" bg="bg-green-50" />
              <QuickStat icon="📐" label="Общая площадь" value="1 176 га" color="text-blue-600" bg="bg-blue-50" />
            </div>

            {/* Описание процесса */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                <span>⚙️</span> Как работает анализ
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <ProcessStep
                  step={1}
                  title="API ИСДМ"
                  description="Скачиваем свежие GeoJSON границы пожаров через REST API ИСДМ-Рослесхоз"
                  icon="📡"
                />
                <ProcessStep
                  step={2}
                  title="Лесной фонд"
                  description="Загружаем GeoPackage с выделами: порода, возраст, бонитет, площадь"
                  icon="🌲"
                />
                <ProcessStep
                  step={3}
                  title="Overlay"
                  description="GeoPandas.overlay() — пространственное пересечение и расчёт площадей"
                  icon="🔀"
                />
                <ProcessStep
                  step={4}
                  title="Отчёт"
                  description="Excel с таблицами + PDF-карта — автоматическая еженедельная сводка"
                  icon="📋"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && <DataTable />}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <ReportGenerator />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                <span>📝</span> Что включено в отчёты
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="font-semibold text-sm text-emerald-800 mb-2">📊 Excel-отчёт</div>
                  <ul className="text-xs text-emerald-700 space-y-1">
                    <li>• Лист «Сводка» — общая статистика</li>
                    <li>• Лист «Анализ» — детальные данные по выделам</li>
                    <li>• Лист «По породам» — группировка по видам деревьев</li>
                    <li>• Лист «По возрасту» — разбивка по возрастным группам</li>
                    <li>• Лист «Порода×Возраст» — кросс-таблица</li>
                    <li>• Лист «Реестр» — полный список пожаров</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-semibold text-sm text-red-800 mb-2">🗺️ PDF-карта</div>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Карта-схема расположения пожаров</li>
                    <li>• Границы лесных выделов</li>
                    <li>• Зоны горения с цветовой кодировкой</li>
                    <li>• Таблица статистики по породам</li>
                    <li>• Таблица по возрастным группам</li>
                    <li>• Дата формирования и идентификаторы</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-6">
            <PythonScript />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                <span>🔧</span> Настройка и запуск
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-xs text-gray-700 mb-2">1. Установка зависимостей</div>
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{`pip install geopandas pandas numpy \\
  requests matplotlib openpyxl \\
  shapely fiona pyproj`}
                  </pre>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-xs text-gray-700 mb-2">2. Запуск скрипта</div>
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{`# Настройте CONFIG в начале скрипта:
# - region_code: код региона
# - forest_fund_path: путь к GPKG
# - output_dir: папка для отчётов

python geopandas_analysis.py`}
                  </pre>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-xs text-gray-700 mb-2">3. Cron (автоматизация)</div>
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{`# Еженедельный запуск по понедельникам
0 8 * * 1 /usr/bin/python3 \\
  /opt/lespozharg/scripts/\\
  geopandas_analysis.py`}
                  </pre>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-xs text-gray-700 mb-2">4. Результат</div>
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{`reports/
├── Сводка_пожары_2026-09-14.xlsx
│   (6 листов с данными)
└── Карта_пожары_2026-09-14.pdf
    (карта + таблицы)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-xs">
            ЛесПожар-Аналитика v2.0 | GeoPandas + ИСДМ-Рослесхоз API
          </div>
          <div className="text-xs">
            Пространственный анализ лесных пожаров для лесничеств
          </div>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: string; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function QuickStat({ icon, label, value, color, bg }: {
  icon: string; label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-3 border border-gray-200/50`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ProcessStep({ step, title, description, icon }: {
  step: number; title: string; description: string; icon: string;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {step}
        </span>
        <span className="text-sm font-semibold text-gray-800">{icon} {title}</span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed pl-7">{description}</p>
    </div>
  );
}
