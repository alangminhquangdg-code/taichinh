/**
 * FORMATTERS UTILITIES
 * Currency, Dates, Percentages, and String helpers
 */

// Format Currency based on current settings (VND, USD, EUR, etc.)
export function formatCurrency(amount, currency = 'VND') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  const num = Number(amount);
  
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(num);
  } else if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  } else if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  }
  
  return new Intl.NumberFormat('vi-VN').format(num) + ' ' + currency;
}

// Compact currency format for badges/charts (e.g. 1.25 tr ₫, 3.5 tỷ ₫)
export function formatCompactCurrency(amount, currency = 'VND') {
  const num = Math.abs(Number(amount) || 0);
  const sign = Number(amount) < 0 ? '-' : '';

  if (currency === 'VND') {
    if (num >= 1_000_000_000) {
      return `${sign}${(num / 1_000_000_000).toFixed(1)} tỷ ₫`;
    }
    if (num >= 1_000_000) {
      return `${sign}${(num / 1_000_000).toFixed(1)} tr ₫`;
    }
    if (num >= 1_000) {
      return `${sign}${(num / 1_000).toFixed(0)} k ₫`;
    }
    return `${sign}${num.toLocaleString('vi-VN')} ₫`;
  }

  // Fallback
  return formatCurrency(amount, currency);
}

// Format Percentage
export function formatPercentage(value, decimals = 1) {
  const num = Number(value) || 0;
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

// Format Date to Vietnamese format (DD/MM/YYYY)
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Format Relative Date (Hôm nay, Hôm qua, 3 ngày trước, DD/MM)
export function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Hôm nay';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';

  return formatDate(dateString);
}

// Escape HTML helper to prevent XSS
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate unique ID
export function generateUUID() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}
