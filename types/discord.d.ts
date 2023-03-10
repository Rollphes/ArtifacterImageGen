import { CustomApplicationCommandData } from '@/handler/appCommands'
import { BuildCardPanel } from '@/lib/BuildCardPanel'
import { CustomEnkaNetwork } from '@/lib/CustomEnkaManager'
import { InteractionExecute } from '@/lib/interaction'

declare module 'discord.js' {
  export interface Client {
    inputCache: Map<number, number>
    commandList: CustomApplicationCommandData[]
    interactionExecute: InteractionExecute
    enkaNetwork: CustomEnkaNetwork
    buildCardPanel: BuildCardPanel
  }
}
