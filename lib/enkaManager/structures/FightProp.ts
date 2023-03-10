import {
  FightPropIds,
  FightPropKeys,
  ValueOf,
} from '@/lib/enkaManager/types/types'

export const fightProp = (
  data: Partial<{
    [key in ValueOf<typeof FightPropIds>]: number
  }>
) => {
  const res: Partial<{
    [key in FightPropKeys]: number
  }> = {}
  const keys = Object.keys(FightPropIds) as FightPropKeys[]
  keys.forEach((key) => {
    res[key] = data[FightPropIds[key]] || 0
  })
  return res
}
