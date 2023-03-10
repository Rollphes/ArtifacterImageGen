import { statusIcon } from '@/lib/buildCard/json/iconConfig.json'
import { PropType } from '@/lib/enkaManager'

export const statusIconSVG = (value: PropType): string => {
  let key: keyof typeof statusIcon
  switch (value) {
    case 'FIGHT_PROP_HP':
      key = 'HP'
      break
    case 'FIGHT_PROP_HP_PERCENT':
      key = 'HP%'
      break
    case 'FIGHT_PROP_ATTACK':
      key = 'ATK'
      break
    case 'FIGHT_PROP_ATTACK_PERCENT':
      key = 'ATK%'
      break
    case 'FIGHT_PROP_DEFENSE':
      key = 'DEF'
      break
    case 'FIGHT_PROP_DEFENSE_PERCENT':
      key = 'DEF%'
      break
    case 'FIGHT_PROP_CRITICAL':
      key = 'CR'
      break
    case 'FIGHT_PROP_CRITICAL_HURT':
      key = 'CD'
      break
    case 'FIGHT_PROP_CHARGE_EFFICIENCY':
      key = 'ER'
      break
    case 'FIGHT_PROP_ELEMENT_MASTERY':
      key = 'EM'
      break
    case 'FIGHT_PROP_PHYSICAL_ADD_HURT':
      key = 'Phys'
      break
    case 'FIGHT_PROP_FIRE_ADD_HURT':
      key = 'Pyro'
      break
    case 'FIGHT_PROP_ELEC_ADD_HURT':
      key = 'Electro'
      break
    case 'FIGHT_PROP_WATER_ADD_HURT':
      key = 'Hydro'
      break
    case 'FIGHT_PROP_WIND_ADD_HURT':
      key = 'Anemo'
      break
    case 'FIGHT_PROP_ROCK_ADD_HURT':
      key = 'Geo'
      break
    case 'FIGHT_PROP_ICE_ADD_HURT':
      key = 'Cryo'
      break
    case 'FIGHT_PROP_GRASS_ADD_HURT':
      key = 'Dendro'
      break
    default:
      key = 'ATK'
      break
  }
  return statusIcon[key]
}
