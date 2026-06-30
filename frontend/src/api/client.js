const BASE = "/api";

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      errorMsg = data.detail || data.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

const api = {
  getDashboardSummary: async () => {
    const res = await fetch(`${BASE}/dashboard/summary`);
    return handleResponse(res);
  },

  uploadSpecification: async (formData) => {
    const res = await fetch(`${BASE}/upload/specification`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  uploadSubmittal: async (formData) => {
    const res = await fetch(`${BASE}/upload/submittal`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  getDocuments: async () => {
    const res = await fetch(`${BASE}/upload/documents`);
    return handleResponse(res);
  },

  runComplianceCheck: async (poId) => {
    const res = await fetch(`${BASE}/compliance/run/${poId}`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  getComplianceResults: async (poId) => {
    const res = await fetch(`${BASE}/compliance/results/${poId}`);
    return handleResponse(res);
  },

  getNcrs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.severity) params.set("severity", filters.severity);
    if (filters.status) params.set("status", filters.status);
    const query = params.toString();
    const res = await fetch(
      `${BASE}/compliance/ncrs${query ? "?" + query : ""}`,
    );
    return handleResponse(res);
  },

  getNcrDetail: async (ncrId) => {
    const res = await fetch(`${BASE}/compliance/ncr/${ncrId}`);
    return handleResponse(res);
  },

  importSchedule: async (formData) => {
    const res = await fetch(`${BASE}/schedule/import`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  analyzeSchedule: async () => {
    const res = await fetch(`${BASE}/schedule/analyze`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  getScheduleTasks: async () => {
    const res = await fetch(`${BASE}/schedule/tasks`);
    return handleResponse(res);
  },

  getScheduleRisks: async () => {
    const res = await fetch(`${BASE}/schedule/risks`);
    return handleResponse(res);
  },

  queryRFI: async (query) => {
    const res = await fetch(`${BASE}/rfi/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    return handleResponse(res);
  },

  getRFIs: async () => {
    const res = await fetch(`${BASE}/rfi/rfis`);
    return handleResponse(res);
  },

  getPurchaseOrders: async () => {
    const res = await fetch(`${BASE}/dashboard/summary`);
    const data = await handleResponse(res);
    return data.purchase_orders || [];
  },
};

export default api;
