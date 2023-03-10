import { PropType } from '@/lib/enkaManager'

export const convertStatValue = (
  statType: PropType,
  statValue: string | number
): string => {
  const value = +statValue
  return statType.match(/_PERCENT|_CRITICAL|_CHARGE|_ADD/g)
    ? new Intl.NumberFormat('ja', {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }).format(value + 0) + '%'
    : new Intl.NumberFormat('ja', {
        maximumFractionDigits: 0,
      }).format(value + 0)
}
