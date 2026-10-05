import { Category, Product, Order, ExchangeRate, DeviceSetting, StatsSummary, PeriodStat, CategoryStat, ProductStat } from '../types';

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
    barcode: '7591001001',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-2',
    categoryId: 'cat-3',
    name: 'Croissant de mantequilla',
    description: 'Croissant hojaldrado horneado diariamente con mantequilla francesa',
    priceUsd: 3.25,
    barcode: '7591001002',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-3',
    categoryId: 'cat-3',
    name: 'Desayuno premium',
    description: 'Huevos revueltos, tostadas artesanales, tocineta y café',
    priceUsd: 8.50,
    barcode: '7591001003',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-4',
    categoryId: 'cat-2',
    name: 'Cupcake de arándanos',
    description: 'Bizcocho suave con arándanos silvestres y frosting de queso crema',
    priceUsd: 3.75,
    barcode: '7591001004',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-5',
    categoryId: 'cat-4',
    name: 'Galletas Club Social',
    description: 'Paquete de galletas saladas clásicas 6 unidades',
    priceUsd: 0.50,
    barcode: 'KS-34-KIK',
    stock: 124,
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-6',
    categoryId: 'cat-4',
    name: 'Galletas Oreo',
    description: 'Galleta de chocolate rellena con crema de vainilla',
    priceUsd: 0.96,
    barcode: 'TE-002-ORO',
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-7',
    categoryId: 'cat-2',
    name: 'Pan de Guayaba',
    description: 'Pan dulce artesanal relleno con pulpa de guayaba',
    priceUsd: 0.40,
    barcode: 'PG-001-PAN',
    stock: 89,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-8',
    categoryId: 'cat-2',
    name: 'Torta de vainilla',
    description: 'Porción generosa de torta esponjosa con nevado tradicional',
    priceUsd: 3.50,
    barcode: 'TV-004-TOR',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-9',
    categoryId: 'cat-5',
    name: 'Colonia para caballeros',
    description: 'Fragancia fresca y elegante para caballero 100ml',
    priceUsd: 28.00,
    barcode: 'CH-552-BLK',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  },
  {
    id: 'prod-10',
    categoryId: 'cat-1',
    name: 'Café Espresso Doble',
    description: 'Extracción intensa de granos arábica seleccionados',
    priceUsd: 2.00,
    barcode: '7591001010',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE'
  }
];

export const INITIAL_EXCHANGE_RATE: ExchangeRate = {
  rate: 857.8876,
  sourceCurrency: 'USD',
  targetCurrency: 'VES',
  effectiveAt: new Date().toISOString(),
  status: 'ACTIVE'
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8492',
    orderNumber: '#8492',
    userName: 'John M. (Vendedor)',
    customerName: 'Cliente Casual',
    items: [
      { productId: 'prod-1', quantity: 2, priceUsd: 4.50 },
      { productId: 'prod-3', quantity: 1, priceUsd: 8.50 },
      { productId: 'prod-4', quantity: 2, priceUsd: 3.75 },
      { productId: 'prod-9', quantity: 1, priceUsd: 17.50 }
    ],
    totalUsd: 42.50,
    totalVes: 42.50 * 857.8876,
    exchangeRate: 857.8876,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: 'ord-8491',
    orderNumber: '#8491',
    userName: 'John M. (Vendedor)',
    customerName: 'Sarah Jenkins',
    items: [
      { productId: 'prod-2', quantity: 2, priceUsd: 3.25 },
      { productId: 'prod-10', quantity: 2, priceUsd: 2.00 },
      { productId: 'prod-7', quantity: 3, priceUsd: 0.50 }
    ],
    totalUsd: 12.00,
    totalVes: 12.00 * 857.8876,
    exchangeRate: 857.8876,
    paymentMethod: 'CASH',
    amountReceivedUsd: 20.00,
    changeGivenUsd: 8.00,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'ord-8490',
    orderNumber: '#8490',
    userName: 'John M. (Vendedor)',
    customerName: 'Michael Chen',
    items: [
      { productId: 'prod-9', quantity: 5, priceUsd: 28.00 },
      { productId: 'prod-1', quantity: 2, priceUsd: 4.50 },
      { productId: 'prod-4', quantity: 2, priceUsd: 3.60 }
    ],
    totalUsd: 156.20,
    totalVes: 156.20 * 857.8876,
    exchangeRate: 857.8876,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  },
  {
    id: 'ord-8489',
    orderNumber: '#8489',
    userName: 'John M. (Vendedor)',
    customerName: 'Elena Ramos',
    items: [
      { productId: 'prod-1', quantity: 2, priceUsd: 4.50 },
      { productId: 'prod-2', quantity: 1, priceUsd: 3.25 },
      { productId: 'prod-8', quantity: 2, priceUsd: 3.50 }
    ],
    totalUsd: 19.25,
    totalVes: 19.25 * 857.8876,
    exchangeRate: 857.8876,
    paymentMethod: 'CASH',
    amountReceivedUsd: 20.00,
    changeGivenUsd: 0.75,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  }
];

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

export const MOCK_DAILY_STATS: PeriodStat[] = [
  { period: '08:00', revenueUsd: 45.0, ordersCount: 5 },
  { period: '10:00', revenueUsd: 120.5, ordersCount: 14 },
  { period: '12:00', revenueUsd: 310.0, ordersCount: 28 },
  { period: '14:00', revenueUsd: 245.2, ordersCount: 22 },
  { period: '16:00', revenueUsd: 390.8, ordersCount: 35 },
  { period: '18:00', revenueUsd: 480.0, ordersCount: 38 },
  { period: '20:00', revenueUsd: 210.5, ordersCount: 18 }
];

export const MOCK_WEEKLY_STATS: PeriodStat[] = [
  { period: 'Lun', revenueUsd: 580.4, ordersCount: 42 },
  { period: 'Mar', revenueUsd: 620.0, ordersCount: 45 },
  { period: 'Mié', revenueUsd: 540.8, ordersCount: 39 },
  { period: 'Jue', revenueUsd: 710.2, ordersCount: 51 },
  { period: 'Vie', revenueUsd: 890.5, ordersCount: 68 },
  { period: 'Sáb', revenueUsd: 940.0, ordersCount: 74 },
  { period: 'Dom', revenueUsd: 420.0, ordersCount: 32 }
];

export const MOCK_CATEGORY_STATS: CategoryStat[] = [
  { categoryId: 'cat-1', categoryName: 'Café y Bebidas', percentage: 41, revenueUsd: 1755.0, itemsSold: 390 },
  { categoryId: 'cat-3', categoryName: 'Comidas y Sándwiches', percentage: 25, revenueUsd: 1070.1, itemsSold: 165 },
  { categoryId: 'cat-2', categoryName: 'Postres y Dulces', percentage: 22, revenueUsd: 941.7, itemsSold: 260 },
  { categoryId: 'cat-4', categoryName: 'Snacks y Otros', percentage: 12, revenueUsd: 513.7, itemsSold: 210 }
];

export const MOCK_TOP_PRODUCTS: ProductStat[] = [
  { productId: 'prod-1', productName: 'Caramel Macchiato', categoryName: 'Bebidas', unitsSold: 142, revenueUsd: 639.0 },
  { productId: 'prod-2', productName: 'Croissant de mantequilla', categoryName: 'Comidas', unitsSold: 98, revenueUsd: 318.5 },
  { productId: 'prod-3', productName: 'Desayuno premium', categoryName: 'Comidas', unitsSold: 76, revenueUsd: 646.0 },
  { productId: 'prod-4', productName: 'Cupcake de arándanos', categoryName: 'Postres', unitsSold: 64, revenueUsd: 240.0 },
  { productId: 'prod-8', productName: 'Torta de vainilla', categoryName: 'Postres', unitsSold: 52, revenueUsd: 182.0 }
];
