// Моковые данные границ пожаров (имитация API ИСДМ-Рослесхоз)
export interface FireBoundary {
  id: string;
  name: string;
  area_ha: number;
  start_date: string;
  status: 'active' | 'contained' | 'extinguished';
  coordinates: [number, number][]; // [lat, lng] polygon
  center: [number, number];
  danger_class: number;
}

export interface ForestPlot {
  id: string;
  kvartal: number;
  viel: number;
  area_ha: number;
  species: string;
  age: number;
  age_group: string;
  bonitet: string;
  coordinates: [number, number][];
  center: [number, number];
}

export interface AnalysisResult {
  species: string;
  age_group: string;
  area_burned_ha: number;
  percent_of_plot: number;
  plot_id: string;
  fire_id: string;
}

// Границы пожаров (координаты в районе Красноярского края)
export const fireBoundaries: FireBoundary[] = [
  {
    id: 'FIRE-001',
    name: 'Пожар №24-А-001',
    area_ha: 342.5,
    start_date: '2026-09-01',
    status: 'active',
    danger_class: 4,
    center: [56.23, 92.85],
    coordinates: [
      [56.25, 92.80], [56.26, 92.85], [56.24, 92.90],
      [56.22, 92.88], [56.21, 92.83], [56.23, 92.80]
    ]
  },
  {
    id: 'FIRE-002',
    name: 'Пожар №24-А-002',
    area_ha: 156.8,
    start_date: '2026-09-03',
    status: 'active',
    danger_class: 3,
    center: [56.18, 92.95],
    coordinates: [
      [56.20, 92.92], [56.21, 92.96], [56.19, 92.99],
      [56.17, 92.97], [56.16, 92.93], [56.18, 92.91]
    ]
  },
  {
    id: 'FIRE-003',
    name: 'Пожар №24-А-003',
    area_ha: 89.2,
    start_date: '2026-09-05',
    status: 'contained',
    danger_class: 2,
    center: [56.30, 92.78],
    coordinates: [
      [56.32, 92.75], [56.33, 92.79], [56.31, 92.82],
      [56.29, 92.80], [56.28, 92.76], [56.30, 92.74]
    ]
  },
  {
    id: 'FIRE-004',
    name: 'Пожар №24-А-004',
    area_ha: 521.0,
    start_date: '2026-08-28',
    status: 'extinguished',
    danger_class: 5,
    center: [56.15, 92.70],
    coordinates: [
      [56.18, 92.65], [56.19, 92.72], [56.16, 92.76],
      [56.13, 92.74], [56.12, 92.68], [56.14, 92.64]
    ]
  },
  {
    id: 'FIRE-005',
    name: 'Пожар №24-А-005',
    area_ha: 67.3,
    start_date: '2026-09-08',
    status: 'active',
    danger_class: 3,
    center: [56.27, 92.92],
    coordinates: [
      [56.29, 92.90], [56.29, 92.93], [56.27, 92.95],
      [56.25, 92.93], [56.25, 92.90], [56.27, 92.89]
    ]
  }
];

// База лесного фонда (выделы)
export const forestPlots: ForestPlot[] = [
  {
    id: 'FP-001', kvartal: 12, viel: 3, area_ha: 45.2,
    species: 'Сосна', age: 80, age_group: 'Спелые',
    bonitet: 'I', center: [56.24, 92.84],
    coordinates: [[56.25, 92.82], [56.26, 92.85], [56.24, 92.86], [56.23, 92.83]]
  },
  {
    id: 'FP-002', kvartal: 12, viel: 5, area_ha: 38.7,
    species: 'Лиственница', age: 120, age_group: 'Перестойные',
    bonitet: 'II', center: [56.23, 92.87],
    coordinates: [[56.24, 92.85], [56.25, 92.88], [56.23, 92.89], [56.22, 92.86]]
  },
  {
    id: 'FP-003', kvartal: 13, viel: 1, area_ha: 52.1,
    species: 'Ель', age: 60, age_group: 'Приспевающие',
    bonitet: 'I', center: [56.19, 92.94],
    coordinates: [[56.20, 92.92], [56.21, 92.95], [56.19, 92.96], [56.18, 92.93]]
  },
  {
    id: 'FP-004', kvartal: 13, viel: 4, area_ha: 29.5,
    species: 'Берёза', age: 35, age_group: 'Средневозрастные',
    bonitet: 'II', center: [56.18, 92.96],
    coordinates: [[56.19, 92.94], [56.20, 92.97], [56.18, 92.98], [56.17, 92.95]]
  },
  {
    id: 'FP-005', kvartal: 14, viel: 2, area_ha: 61.3,
    species: 'Сосна', age: 45, age_group: 'Средневозрастные',
    bonitet: 'I', center: [56.31, 92.77],
    coordinates: [[56.32, 92.75], [56.33, 92.78], [56.31, 92.80], [56.30, 92.77]]
  },
  {
    id: 'FP-006', kvartal: 14, viel: 6, area_ha: 44.8,
    species: 'Кедр', age: 150, age_group: 'Перестойные',
    bonitet: 'I', center: [56.29, 92.79],
    coordinates: [[56.30, 92.77], [56.31, 92.80], [56.29, 92.81], [56.28, 92.78]]
  },
  {
    id: 'FP-007', kvartal: 15, viel: 1, area_ha: 73.6,
    species: 'Лиственница', age: 90, age_group: 'Спелые',
    bonitet: 'II', center: [56.16, 92.71],
    coordinates: [[56.17, 92.69], [56.18, 92.72], [56.16, 92.74], [56.15, 92.71]]
  },
  {
    id: 'FP-008', kvartal: 15, viel: 3, area_ha: 55.2,
    species: 'Сосна', age: 25, age_group: 'Молодняки',
    bonitet: 'I', center: [56.14, 92.73],
    coordinates: [[56.15, 92.71], [56.16, 92.74], [56.14, 92.75], [56.13, 92.72]]
  },
  {
    id: 'FP-009', kvartal: 16, viel: 2, area_ha: 33.4,
    species: 'Пихта', age: 70, age_group: 'Спелые',
    bonitet: 'I', center: [56.27, 92.91],
    coordinates: [[56.28, 92.89], [56.29, 92.92], [56.27, 92.93], [56.26, 92.90]]
  },
  {
    id: 'FP-010', kvartal: 16, viel: 5, area_ha: 41.9,
    species: 'Ель', age: 15, age_group: 'Молодняки',
    bonitet: 'II', center: [56.26, 92.93],
    coordinates: [[56.27, 92.91], [56.28, 92.94], [56.26, 92.95], [56.25, 92.92]]
  },
  {
    id: 'FP-011', kvartal: 17, viel: 1, area_ha: 48.5,
    species: 'Берёза', age: 50, age_group: 'Приспевающие',
    bonitet: 'II', center: [56.22, 92.82],
    coordinates: [[56.23, 92.80], [56.24, 92.83], [56.22, 92.84], [56.21, 92.81]]
  },
  {
    id: 'FP-012', kvartal: 17, viel: 4, area_ha: 36.8,
    species: 'Кедр', age: 100, age_group: 'Спелые',
    bonitet: 'I', center: [56.20, 92.85],
    coordinates: [[56.21, 92.83], [56.22, 92.86], [56.20, 92.87], [56.19, 92.84]]
  }
];

// Результаты анализа пересечения пожаров и лесного фонда
export const analysisResults: AnalysisResult[] = [
  { species: 'Сосна', age_group: 'Спелые', area_burned_ha: 32.4, percent_of_plot: 71.7, plot_id: 'FP-001', fire_id: 'FIRE-001' },
  { species: 'Лиственница', age_group: 'Перестойные', area_burned_ha: 28.1, percent_of_plot: 72.6, plot_id: 'FP-002', fire_id: 'FIRE-001' },
  { species: 'Ель', age_group: 'Приспевающие', area_burned_ha: 41.3, percent_of_plot: 79.3, plot_id: 'FP-003', fire_id: 'FIRE-002' },
  { species: 'Берёза', age_group: 'Средневозрастные', area_burned_ha: 22.7, percent_of_plot: 77.3, plot_id: 'FP-004', fire_id: 'FIRE-002' },
  { species: 'Сосна', age_group: 'Средневозрастные', area_burned_ha: 48.2, percent_of_plot: 78.6, plot_id: 'FP-005', fire_id: 'FIRE-003' },
  { species: 'Кедр', age_group: 'Перестойные', area_burned_ha: 35.6, percent_of_plot: 79.5, plot_id: 'FP-006', fire_id: 'FIRE-003' },
  { species: 'Лиственница', age_group: 'Спелые', area_burned_ha: 58.9, percent_of_plot: 80.2, plot_id: 'FP-007', fire_id: 'FIRE-004' },
  { species: 'Сосна', age_group: 'Молодняки', area_burned_ha: 44.1, percent_of_plot: 80.0, plot_id: 'FP-008', fire_id: 'FIRE-004' },
  { species: 'Пихта', age_group: 'Спелые', area_burned_ha: 26.8, percent_of_plot: 80.2, plot_id: 'FP-009', fire_id: 'FIRE-005' },
  { species: 'Ель', age_group: 'Молодняки', area_burned_ha: 33.5, percent_of_plot: 80.0, plot_id: 'FP-010', fire_id: 'FIRE-005' },
  { species: 'Берёза', age_group: 'Приспевающие', area_burned_ha: 18.4, percent_of_plot: 37.9, plot_id: 'FP-011', fire_id: 'FIRE-001' },
  { species: 'Кедр', age_group: 'Спелые', area_burned_ha: 29.3, percent_of_plot: 79.2, plot_id: 'FP-012', fire_id: 'FIRE-002' },
];

// Сводная статистика
export const summaryStats = {
  totalFires: 5,
  activeFires: 3,
  totalAreaBurned: 1176.8,
  totalForestAffected: 421.3,
  speciesBreakdown: [
    { species: 'Сосна', area: 124.7, percent: 29.6 },
    { species: 'Лиственница', area: 87.0, percent: 20.6 },
    { species: 'Ель', area: 74.8, percent: 17.8 },
    { species: 'Кедр', area: 64.9, percent: 15.4 },
    { species: 'Берёза', area: 41.1, percent: 9.8 },
    { species: 'Пихта', area: 26.8, percent: 6.4 },
  ],
  ageBreakdown: [
    { age_group: 'Спелые', area: 147.4, percent: 35.0 },
    { age_group: 'Перестойные', area: 63.7, percent: 15.1 },
    { age_group: 'Приспевающие', area: 59.7, percent: 14.2 },
    { age_group: 'Средневозрастные', area: 70.9, percent: 16.8 },
    { age_group: 'Молодняки', area: 77.6, percent: 18.4 },
  ]
};
