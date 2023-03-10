import { Artifact, ItemStats, PropType } from '@/lib/enkaManager'

const correctionStatsValue = (stats: ItemStats) => {
  if (stats.propType == 'FIGHT_PROP_CRITICAL') return stats.value * 2
  if (stats.propType == 'FIGHT_PROP_DEFENSE_PERCENT') return stats.value * 0.8
  if (stats.propType == 'FIGHT_PROP_ELEMENT_MASTERY') return stats.value * 0.25
  if (stats.propType == 'FIGHT_PROP_CHARGE_EFFICIENCY') return stats.value * 0.9
  return stats.value
}
export type ScoringType = 'ATK' | 'DEF' | 'HP' | 'EM' | 'ER'
export const scoringArtifact = (
  artifact: Artifact,
  type: ScoringType
): number => {
  const conversionFilter: { [key in ScoringType]: PropType[] } = {
    HP: [
      'FIGHT_PROP_CRITICAL',
      'FIGHT_PROP_CRITICAL_HURT',
      'FIGHT_PROP_HP_PERCENT',
    ],
    ATK: [
      'FIGHT_PROP_CRITICAL',
      'FIGHT_PROP_CRITICAL_HURT',
      'FIGHT_PROP_ATTACK_PERCENT',
    ],
    DEF: [
      'FIGHT_PROP_CRITICAL',
      'FIGHT_PROP_CRITICAL_HURT',
      'FIGHT_PROP_DEFENSE_PERCENT',
    ],
    EM: [
      'FIGHT_PROP_CRITICAL',
      'FIGHT_PROP_CRITICAL_HURT',
      'FIGHT_PROP_ELEMENT_MASTERY',
    ],
    ER: [
      'FIGHT_PROP_CRITICAL',
      'FIGHT_PROP_CRITICAL_HURT',
      'FIGHT_PROP_CHARGE_EFFICIENCY',
    ],
  }

  return artifact.subStats.reduce((result, stats) => {
    if (conversionFilter[type].includes(stats.propType))
      return result + correctionStatsValue(stats)
    return result
  }, 0)
}
