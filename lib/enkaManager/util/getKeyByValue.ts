export const getKeyByValue = <T>(object: Record<string, T>, value: T) => {
  return Object.keys(object).find((key) => object[key] === value)
}
