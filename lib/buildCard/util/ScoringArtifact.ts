import { Artifact, FightPropType, StatProperty } from 'genshin-manager'

function correctionStatsValue(stat: StatProperty): number {
  const value = +stat.valueText.replace('%', '')

  switch (stat.type) {
    case 'FIGHT_PROP_CRITICAL':
      return value * 2
    case 'FIGHT_PROP_ELEMENT_MASTERY':
      return value * 0.25
    default:
      return value
  }
}

export type ScoringType = 'ATK' | 'DEF' | 'HP' | 'EM' | 'ER'

export function scoringArtifact(artifact: Artifact, type: ScoringType): number {
  const conversionFilter: { [key in ScoringType]: FightPropType[] } = {
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
    if (conversionFilter[type].includes(stats.type))
      return result + correctionStatsValue(stats)
    return result
  }, 0)
}
