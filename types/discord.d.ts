import { EnkaManager } from 'genshin-manager'

import { CustomApplicationCommandData } from '@/handler/appCommands'
import { BuildCardPanel } from '@/lib/BuildCardPanel'
import { InteractionExecute } from '@/lib/interaction'

declare module 'discord.js' {
  export interface Client {
    commandList: CustomApplicationCommandData[]
    interactionExecute: InteractionExecute
    enkaManager: EnkaManager
    buildCardPanel: BuildCardPanel
  }
}
