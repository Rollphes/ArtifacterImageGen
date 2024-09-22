import { Blend } from 'sharp'

export interface PartsConfigTypes {
  readonly partsName: string
  readonly position: Position
  blend?: Blend
  parts?: PartsConfigTypes[]

  getCachePath?: () => string
  partsCreate(): Buffer | Promise<Buffer>
}

export interface Position {
  top: number
  left: number
}

export interface Size {
  width: number
  height: number
}
