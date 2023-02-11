export type ReplaceObjectValues<T, K extends keyof T, N extends Record<K, unknown>> = Omit<T, K> & {
  [P in K]: N[P];
};
