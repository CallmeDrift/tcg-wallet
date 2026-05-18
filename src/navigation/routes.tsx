export const ROUTES = {
  HOME: '/',
  ADD_CARD: '/add-card',
  REGISTER: '/register',
  PORTFOLIO: '/portfolio',
  PROFIT_VALUE: '/profit-value',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
