const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function getPortfolioSummary() {
  const response = await fetch(`${API_BASE_URL}/portfolio/summary`);
  return response.json();
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE_URL}/analytics/metrics`);
  return response.json();
}