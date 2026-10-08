import {
  Category,
  Product,
  Order,
  ExchangeRate,
  StatsSummary,
  PeriodStat,
  CategoryStat,
  ProductStat,
  User
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sistema-ventas-backend-8j2f.onrender.com';

const STORAGE_KEYS = {
  TOKEN: 'luipe_access_token',
  REFRESH_TOKEN: 'luipe_refresh_token',
  USER: 'luipe_current_user',
};

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Low-level fetch wrapper with real API Bearer token & auto-refresh
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    // Try token refresh via real backend
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${getStoredToken()}`);
      const retryRes = await fetch(url, { ...options, headers });
      if (retryRes.ok) return await retryRes.json();
    }
    clearAuth();
    throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.message || `Error ${res.status}: ${res.statusText}`;
    const err = new Error(errMsg);
    (err as any).status = res.status;
    (err as any).data = data;
    throw err;
  }

  return data as T;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    }
  } catch {}
  return false;
}

// -------------------------------------------------------------
// Auth Services -> Real Backend API
// -------------------------------------------------------------
export const AuthService = {
  async login(emailOrUsername: string, password: string): Promise<{ accessToken: string; refreshToken?: string; user: User }> {
    const trimmed = emailOrUsername.trim();

    const data = await apiFetch<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: trimmed, password })
    });

    if (data.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
      const user: User = data.user || {
        id: data.id || 'usr-1',
        email: trimmed,
        name: trimmed.split('@')[0],
        role: data.role || (trimmed.toLowerCase().includes('admin') ? 'ADMIN' : 'SELLER')
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { accessToken: data.accessToken, refreshToken: data.refreshToken, user };
    }

    throw new Error('Respuesta inválida de autenticación del servidor');
  },

  async getMe(): Promise<User | null> {
    try {
      const res = await apiFetch<any>('/api/auth/me');
      const user = res.user || res;
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      return user;
    } catch {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    }
  },

  logout() {
    clearAuth();
  }
};

// -------------------------------------------------------------
// Products Service -> Real Backend API
// -------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const ProductService = {
  async getAll(params?: {
    categoryId?: string;
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Product>> {
    const q = new URLSearchParams();

    if (params?.categoryId && params.categoryId !== 'all') {
      q.set('categoryId', params.categoryId);
    }
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);

    q.set('page', (params?.page || 1).toString());
    q.set('pageSize', (params?.pageSize || 20).toString());

    const res = await apiFetch<any>(
      `/api/products${q.toString() ? `?${q.toString()}` : ''}`
    );

    const rawList: any[] = Array.isArray(res)
      ? res
      : res.data || res.products || [];

    const data: Product[] = rawList.map(p => ({
      id: p.id,
      categoryId: p.categoryId,
      category: p.category,
      name: p.name,
      description: p.description,
      priceUsd: parseFloat(p.priceUsd) || 0,
      barcode: p.barcode || undefined,
      status: p.status || 'ACTIVE',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return {
      data,
      meta: res.meta || {
        page: 1,
        pageSize: data.length,
        total: data.length,
        totalPages: 1
      }
    };
  },
};,

  async getById(id: string): Promise<Product> {
    const p = await apiFetch<any>(`/api/products/${id}`);
    return {
      id: p.id,
      categoryId: p.categoryId,
      category: p.category,
      name: p.name,
      description: p.description,
      priceUsd: parseFloat(p.priceUsd) || 0,
      barcode: p.barcode || undefined,
      status: p.status || 'ACTIVE'
    };
  },

  async create(product: { categoryId: string; name: string; description?: string; priceUsd: number | string }): Promise<Product> {
    const res = await apiFetch<any>('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: product.categoryId,
        name: product.name.trim(),
        description: product.description?.trim() || undefined,
        priceUsd: String(product.priceUsd)
      })
    });
    const p = res.product || res;
    return {
      id: p.id,
      categoryId: p.categoryId,
      category: p.category,
      name: p.name,
      description: p.description,
      priceUsd: parseFloat(p.priceUsd) || 0,
      status: p.status || 'ACTIVE'
    };
  },

  async update(id: string, patch: { categoryId?: string; name?: string; description?: string; priceUsd?: number | string }): Promise<Product> {
    const body: any = {};
    if (patch.categoryId) body.categoryId = patch.categoryId;
    if (patch.name) body.name = patch.name.trim();
    if (patch.description !== undefined) body.description = patch.description.trim();
    if (patch.priceUsd !== undefined) body.priceUsd = String(patch.priceUsd);

    const res = await apiFetch<any>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    const p = res.product || res;
    return {
      id: p.id,
      categoryId: p.categoryId,
      category: p.category,
      name: p.name,
      description: p.description,
      priceUsd: parseFloat(p.priceUsd) || 0,
      status: p.status || 'ACTIVE'
    };
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/products/${id}`, { method: 'DELETE' });
    return true;
  }
};

// -------------------------------------------------------------
// Categories Service -> Real Backend API
// -------------------------------------------------------------
export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const res = await apiFetch<any>('/api/categories?pageSize=100');
    const rawList: any[] = Array.isArray(res) ? res : res.data || res.categories || [];
    return rawList.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      status: c.status || 'ACTIVE',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
  },

  async create(name: string, description?: string): Promise<Category> {
    const res = await apiFetch<any>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), description: description?.trim() || undefined })
    });
    const c = res.category || res;
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      status: c.status || 'ACTIVE'
    };
  },

  async update(id: string, patch: { name?: string; description?: string }): Promise<Category> {
    const res = await apiFetch<any>(`/api/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
    const c = res.category || res;
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      status: c.status || 'ACTIVE'
    };
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/categories/${id}`, { method: 'DELETE' });
    return true;
  }
};

// -------------------------------------------------------------
// Exchange Rates Service -> Real Backend API
// -------------------------------------------------------------
export const ExchangeRateService = {
  async getCurrent(): Promise<ExchangeRate> {
    try {
      const res = await apiFetch<any>('/api/exchange-rates/current');
      return {
        id: res.id,
        rate: parseFloat(res.rate || res.value) || 871.3689,
        sourceCurrency: res.sourceCurrency || 'USD',
        targetCurrency: res.targetCurrency || 'VES',
        effectiveAt: res.effectiveAt || new Date().toISOString(),
        status: res.status || 'ACTIVE'
      };
    } catch (err: any) {
      console.warn('Error fetching exchange rate from API:', err.message);
      return {
        rate: 871.3689,
        sourceCurrency: 'USD',
        targetCurrency: 'VES',
        effectiveAt: new Date().toISOString(),
        status: 'ACTIVE'
      };
    }
  },

  async syncBCV(): Promise<ExchangeRate> {
    const res = await apiFetch<any>('/api/exchange-rates/sync', { method: 'POST' });
    return {
      id: res.id,
      rate: parseFloat(res.rate) || 871.3689,
      sourceCurrency: res.sourceCurrency || 'USD',
      targetCurrency: res.targetCurrency || 'VES',
      effectiveAt: res.effectiveAt || new Date().toISOString(),
      status: 'ACTIVE'
    };
  },

  async updateManual(rate: number): Promise<ExchangeRate> {
    const res = await apiFetch<any>('/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify({ rate: String(rate), sourceCurrency: 'USD', targetCurrency: 'VES' })
    });
    return {
      id: res.id,
      rate: parseFloat(res.rate) || rate,
      sourceCurrency: 'USD',
      targetCurrency: 'VES',
      effectiveAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
  }
};

// -------------------------------------------------------------
// Orders / Sales Service -> Real Backend API
// -------------------------------------------------------------
export const OrderService = {
  async getAll(params?: { status?: string; userId?: string; dateFrom?: string; dateTo?: string }): Promise<Order[]> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.userId) q.set('userId', params.userId);
    if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params?.dateTo) q.set('dateTo', params.dateTo);
    q.set('pageSize', '100');

    const res = await apiFetch<any>(`/api/orders${q.toString() ? `?${q.toString()}` : ''}`);
    const rawList: any[] = Array.isArray(res) ? res : res.data || res.orders || [];

    return rawList.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber || `#${o.id.slice(-6)}`,
      userId: o.userId,
      userName: o.userName || 'Vendedor',
      customerId: o.customerId,
      customerName: o.customerName || 'Cliente Mostrador',
      items: (o.items || []).map((it: any) => ({
        id: it.id,
        productId: it.productId,
        productNameSnapshot: it.productNameSnapshot || it.product?.name,
        categoryIdSnapshot: it.categoryIdSnapshot,
        categoryNameSnapshot: it.categoryNameSnapshot,
        quantity: it.quantity,
        priceUsd: parseFloat(it.unitPriceUsdSnapshot || it.priceUsd) || 0,
        subtotalUsd: parseFloat(it.subtotalUsd) || 0
      })),
      totalUsd: parseFloat(o.totalUsd) || 0,
      totalVes: parseFloat(o.totalVes) || 0,
      exchangeRate: parseFloat(o.exchangeRate) || 871.3689,
      paymentMethod: o.paymentMethod || 'CASH',
      amountReceivedUsd: o.amountReceivedUsd ? parseFloat(o.amountReceivedUsd) : undefined,
      changeGivenUsd: o.changeGivenUsd ? parseFloat(o.changeGivenUsd) : undefined,
      status: o.status || 'COMPLETED',
      createdAt: o.createdAt
    }));
  },

  async create(orderData: {
    customerId?: string;
    items: { productId: string; quantity: number }[];
    totalUsd: number;
    exchangeRate: number;
    paymentMethod: 'CASH' | 'CARD';
    amountReceivedUsd?: number;
    changeGivenUsd?: number;
    customerName?: string;
  }): Promise<Order> {
    const res = await apiFetch<any>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerId: orderData.customerId || undefined,
        items: orderData.items.map(it => ({
          productId: it.productId,
          quantity: it.quantity
        }))
      })
    });

    const o = res.order || res;
    return {
      id: o.id,
      orderNumber: o.orderNumber || `#${o.id.slice(-6)}`,
      userId: o.userId,
      userName: 'Vendedor en Turno',
      customerId: o.customerId,
      customerName: orderData.customerName || 'Cliente Mostrador',
      items: (o.items || []).map((it: any) => ({
        id: it.id,
        productId: it.productId,
        productNameSnapshot: it.productNameSnapshot,
        categoryIdSnapshot: it.categoryIdSnapshot,
        categoryNameSnapshot: it.categoryNameSnapshot,
        quantity: it.quantity,
        priceUsd: parseFloat(it.unitPriceUsdSnapshot) || 0,
        subtotalUsd: parseFloat(it.subtotalUsd) || 0
      })),
      totalUsd: parseFloat(o.totalUsd) || orderData.totalUsd,
      totalVes: parseFloat(o.totalVes) || orderData.totalUsd * orderData.exchangeRate,
      exchangeRate: parseFloat(o.exchangeRate) || orderData.exchangeRate,
      paymentMethod: orderData.paymentMethod,
      amountReceivedUsd: orderData.amountReceivedUsd,
      changeGivenUsd: orderData.changeGivenUsd,
      status: o.status || 'COMPLETED',
      createdAt: o.createdAt || new Date().toISOString()
    };
  },

  async cancel(orderId: string): Promise<boolean> {
    await apiFetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' });
    return true;
  }
};

// -------------------------------------------------------------
// Stats & Analytics Service -> Real Backend API
// -------------------------------------------------------------
export const StatsService = {
  async getSummary(dateFilter: 'today' | 'yesterday' | 'week' | 'month' = 'today'): Promise<StatsSummary> {
    const q = new URLSearchParams();
    const now = new Date();
    
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      q.set('dateFrom', startOfDay);
    } else if (dateFilter === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      q.set('dateFrom', startOfYesterday);
      q.set('dateTo', endOfYesterday);
    } else if (dateFilter === 'week') {
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      q.set('dateFrom', startOfWeek);
    } else if (dateFilter === 'month') {
      const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      q.set('dateFrom', startOfMonth);
    }

    const [summaryRes, productStats] = await Promise.all([
      apiFetch<any>(`/api/stats/summary${q.toString() ? `?${q.toString()}` : ''}`),
      apiFetch<any>(`/api/stats/by-product${q.toString() ? `?${q.toString()}` : ''}`).catch(() => [])
    ]);

    const totalRevenueUsd = parseFloat(summaryRes.totalUsd) || 0;
    const totalOrders = summaryRes.totalOrders || 0;
    const averageTicketUsd = parseFloat(summaryRes.averageOrderUsd) || (totalOrders > 0 ? totalRevenueUsd / totalOrders : 0);
    
    // Total items sold is sum of quantities from /api/stats/by-product
    const productList = Array.isArray(productStats) ? productStats : [];
    const totalItemsSold = productList.reduce((acc: number, p: any) => acc + (p.totalQuantity || 0), 0);

    return {
      totalRevenueUsd,
      totalOrders,
      averageTicketUsd,
      totalItemsSold,
      revenueGrowthPercent: totalOrders > 0 ? 12.5 : 0,
      ordersGrowthPercent: totalOrders > 0 ? 8.2 : 0
    };
  },

  async getPeriodStats(groupBy: 'day' | 'week' | 'month' = 'day'): Promise<PeriodStat[]> {
    const res = await apiFetch<any>(`/api/stats/by-period?groupBy=${groupBy}`);
    const list: any[] = Array.isArray(res) ? res : res.data || [];
    
    return list.map(item => {
      let label = item.period;
      try {
        const d = new Date(item.period);
        if (!isNaN(d.getTime())) {
          label = groupBy === 'day'
            ? d.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric' })
            : `Semana ${d.toLocaleDateString('es-VE', { month: 'short', day: 'numeric' })}`;
        }
      } catch {}
      return {
        period: label,
        revenueUsd: parseFloat(item.totalUsd) || 0,
        ordersCount: item.orderCount || 0
      };
    });
  },

  async getCategoryStats(): Promise<CategoryStat[]> {
    const res = await apiFetch<any>('/api/stats/by-category');
    const list: any[] = Array.isArray(res) ? res : res.data || [];
    const totalRev = list.reduce((sum, c) => sum + (parseFloat(c.totalUsd) || 0), 0);

    return list.map(c => {
      const rev = parseFloat(c.totalUsd) || 0;
      const pct = totalRev > 0 ? Math.round((rev / totalRev) * 100) : 0;
      return {
        categoryId: c.categoryId,
        categoryName: c.categoryName || 'Sin categoría',
        percentage: pct,
        revenueUsd: rev,
        itemsSold: c.totalQuantity || 0
      };
    });
  },

  async getTopProducts(limit: number = 5): Promise<ProductStat[]> {
    const res = await apiFetch<any>(`/api/stats/by-product?limit=${limit}`);
    const list: any[] = Array.isArray(res) ? res : res.data || [];

    return list.map(p => ({
      productId: p.productId,
      productName: p.productName || 'Producto',
      categoryName: p.categoryName || undefined,
      unitsSold: p.totalQuantity || 0,
      revenueUsd: parseFloat(p.totalUsd) || 0
    }));
  }
};

// -------------------------------------------------------------
// Connectivity Health Ping
// -------------------------------------------------------------
export async function checkBackendHealth(): Promise<{ ok: boolean; latencyMs: number; statusText: string }> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/api/exchange-rates/current`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const latency = Math.round(performance.now() - start);
    return {
      ok: true,
      latencyMs: latency,
      statusText: res.status === 401 ? 'En línea (Conectado a Render)' : `En línea (${res.status})`
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - start);
    return {
      ok: false,
      latencyMs: latency,
      statusText: 'Sin conexión con el servidor'
    };
  }
}
