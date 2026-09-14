import { analysisResults, summaryStats } from '../data/fireData';

export default function DataTable() {
  return (
    <div className="space-y-6">
      {/* Сводка */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon="🔥"
          label="Всего пожаров"
          value={summaryStats.totalFires.toString()}
          sub={`${summaryStats.activeFires} активных`}
          color="red"
        />
        <StatCard
          icon="📐"
          label="Площадь пожаров"
          value={`${summaryStats.totalAreaBurned}`}
          sub="га"
          color="orange"
        />
        <StatCard
          icon="🌲"
          label="Лес пострадал"
          value={`${summaryStats.totalForestAffected}`}
          sub="га"
          color="green"
        />
        <StatCard
          icon="📊"
          label="Выделов задето"
          value={analysisResults.length.toString()}
          sub="из 12"
          color="blue"
        />
      </div>

      {/* Таблица анализа */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span>📋</span> Результаты пространственного анализа (GeoPandas overlay)
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Пересечение границ пожаров с базой лесного фонда
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Выдел</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Порода</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Возраст</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Горело, га</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">% выдела</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Пожар</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analysisResults.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-3 py-2 font-mono text-gray-500">{row.plot_id}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {row.species}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{row.age_group}</td>
                  <td className="px-3 py-2 text-right font-semibold text-red-600">
                    {row.area_burned_ha.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${row.percent_of_plot}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600">{row.percent_of_plot.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-500">{row.fire_id}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-3 py-2 font-bold text-gray-700" colSpan={3}>ИТОГО:</td>
                <td className="px-3 py-2 text-right font-bold text-red-700">
                  {analysisResults.reduce((s, r) => s + r.area_burned_ha, 0).toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right font-bold text-gray-700">—</td>
                <td className="px-3 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Сводные таблицы */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <h4 className="font-bold text-xs">По породам</h4>
          </div>
          <div className="p-3 space-y-2">
            {summaryStats.speciesBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs w-20 text-gray-700 truncate">{item.species}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-gray-600 w-16 text-right">
                  {item.area} га
                </span>
                <span className="text-xs text-gray-400 w-10 text-right">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <h4 className="font-bold text-xs">По возрастным группам</h4>
          </div>
          <div className="p-3 space-y-2">
            {summaryStats.ageBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs w-28 text-gray-700 truncate">{item.age_group}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-gray-600 w-16 text-right">
                  {item.area} га
                </span>
                <span className="text-xs text-gray-400 w-10 text-right">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string; color: string;
}) {
  const bgColors: Record<string, string> = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    green: 'bg-emerald-50 border-emerald-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`rounded-xl border p-3 ${bgColors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  );
}
