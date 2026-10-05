import { Category, Product, Order, ExchangeRate, DeviceSetting, PeriodStat, CategoryStat, ProductStat } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Bebidas', description: 'Cafés, infusiones, jugos y refrescos', status: 'ACTIVE', productCount: 4 },
  { id: 'cat-2', name: 'Postres', description: 'Tortas, cupcakes, galletas y dulces', status: 'ACTIVE', productCount: 4 },
  { id: 'cat-3', name: 'Sándwiches & Comida', description: 'Desayunos, croissants y sándwiches', status: 'ACTIVE', productCount: 3 },
  { id: 'cat-4', name: 'Golosinas', description: 'Snacks empaquetados y golosinas', status: 'ACTIVE', productCount: 2 },
  { id: 'cat-5', name: 'Quincallería', description: 'Artículos generales de tienda y perfumería', status: 'ACTIVE', productCount: 1 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    name: 'Caramel Macchiato',
    description: 'Espresso con vainilla, leche cremosa y caramelo artesanal',
    priceUsd: 4.50,
    status: 'ACTIVE'
  },
  {
    id: 'prod-2',
    categoryId: 'cat-3',
    name: 'Croissant de mantequilla',
    description: 'Croissant hojaldrado horneado diariamente con mantequilla francesa',
    priceUsd: 3.25,
    status: 'ACTIVE'
  },
  {
    id: 'prod-3',
    categoryId: 'cat-3',
    name: 'Desayuno premium',
    description: 'Huevos revueltos, tostadas artesanales, tocineta y café',
    priceUsd: 8.50,
    status: 'ACTIVE'
  },
  {
    id: 'prod-4',
    categoryId: 'cat-2',
    name: 'Cupcake de arándanos',
    description: 'Bizcocho suave con arándanos silvestres y frosting de queso crema',
    priceUsd: 3.75,
    status: 'ACTIVE'
  }
];

export const INITIAL_EXCHANGE_RATE: ExchangeRate = {
  rate: 871.3689,
  sourceCurrency: 'USD',
  targetCurrency: 'VES',
  effectiveAt: new Date().toISOString(),
  status: 'ACTIVE'
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_DEVICES: DeviceSetting[] = [
  {
    id: 'dev-1',
    name: 'Star TSP100 (Caja)',
    type: 'printer',
    connectionType: 'network',
    address: '192.168.1.45',
    status: 'connected',
    location: 'Caja Principal'
  },
  {
    id: 'dev-2',
    name: 'Epson TM-T88VI (Comandera)',
    type: 'printer',
    connectionType: 'bluetooth',
    address: 'BT-00:22:14:11',
    status: 'connected',
    location: 'Barra y Cocina'
  },
  {
    id: 'dev-3',
    name: 'Zebra ZD421 (Scanner)',
    type: 'scanner',
    connectionType: 'usb',
    address: 'Port 2 [0304:41]',
    status: 'connected',
    location: 'Mostrador'
  }
];

export const MOCK_DAILY_STATS: PeriodStat[] = [];
export const MOCK_WEEKLY_STATS: PeriodStat[] = [];
export const MOCK_CATEGORY_STATS: CategoryStat[] = [];
export const MOCK_TOP_PRODUCTS: ProductStat[] = [];
