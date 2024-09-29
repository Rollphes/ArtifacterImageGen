import { Client as OriginalClient, ClientOptions } from 'discord.js'
import { EnkaManager } from 'genshin-manager'

import { commandDatas } from '@/handler/appCommands'
import { BuildCardPanel } from '@/lib/BuildCardPanel'
import { InteractionExecute } from '@/lib/interaction'

export default class Client extends OriginalClient {
  constructor(options: ClientOptions) {
    super(options)
    this.commandList = commandDatas
    this.enkaManager = new EnkaManager()
    this.buildCardPanel = new BuildCardPanel(this)
    this.interactionExecute = new InteractionExecute(this)
  }
}
