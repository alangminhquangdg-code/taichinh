/**
 * CHARTS UTILITY - Chart.js Wrapper & Themes
 */
import { formatCurrency, formatCompactCurrency } from './formatters.js';

let chartInstances = {};

// Destroy an existing chart instance safely
export function destroyChart(chartId) {
  if (chartInstances[chartId]) {
    chartInstances[chartId].destroy();
    delete chartInstances[chartId];
  }
}

// Get Theme Colors for Chart
function getChartTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    textColor: isLight ? '#4b5563' : '#9ca3af',
    gridColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  };
}

// Create Cash Flow Bar/Line Chart (Thu Nhập vs Chi Tiêu)
export function renderCashFlowChart(canvasId, labels, incomeData, expenseData, savingsData = null) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const theme = getChartTheme();

  const datasets = [
    {
      label: 'Thu nhập',
      data: incomeData,
      backgroundColor: 'rgba(16, 185, 129, 0.85)',
      borderRadius: 6,
      barThickness: 16
    },
    {
      label: 'Chi tiêu',
      data: expenseData,
      backgroundColor: 'rgba(239, 68, 68, 0.85)',
      borderRadius: 6,
      barThickness: 16
    }
  ];

  if (savingsData) {
    datasets.push({
      type: 'line',
      label: 'Tiết kiệm ròng',
      data: savingsData,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
      tension: 0.35,
      fill: true
    });
  }

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: theme.textColor,
            font: { family: theme.fontFamily, weight: '600', size: 12 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleFont: { family: theme.fontFamily, size: 13, weight: 'bold' },
          bodyFont: { family: theme.fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += formatCurrency(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: theme.textColor, font: { family: theme.fontFamily } }
        },
        y: {
          grid: { color: theme.gridColor },
          ticks: {
            color: theme.textColor,
            font: { family: theme.fontFamily },
            callback: (val) => formatCompactCurrency(val)
          }
        }
      }
    }
  });
}

// Create Expense Categories Donut Chart
export function renderCategoryDonutChart(canvasId, labels, data, colors) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const theme = getChartTheme();

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors || [
          '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
          '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316'
        ],
        borderWidth: 2,
        borderColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#fff' : '#111827'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: theme.textColor,
            font: { family: theme.fontFamily, weight: '500', size: 12 },
            usePointStyle: true,
            boxWidth: 8,
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleFont: { family: theme.fontFamily, size: 13 },
          bodyFont: { family: theme.fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// Create Radar Chart for Financial Health Score Dimensions
export function renderFinancialHealthRadar(canvasId, labels, scores) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const theme = getChartTheme();

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Điểm số gia đình',
        data: scores,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.25)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10b981',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          angleLines: { color: theme.gridColor },
          grid: { color: theme.gridColor },
          pointLabels: {
            color: theme.textColor,
            font: { family: theme.fontFamily, size: 11, weight: '600' }
          },
          ticks: {
            display: false,
            stepSize: 20
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}
