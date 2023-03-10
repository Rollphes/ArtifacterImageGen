import { Client as OriginalClient, ClientOptions } from 'discord.js'

import { commandDatas } from '@/handler/appCommands'
import { BuildCardPanel } from '@/lib/BuildCardPanel'
import { CustomEnkaNetwork } from '@/lib/CustomEnkaManager'
import { InteractionExecute } from '@/lib/interaction'

export default class Client extends OriginalClient {
  constructor(options: ClientOptions) {
    super(options)
    this.commandList = commandDatas
    this.enkaNetwork = new CustomEnkaNetwork()
    this.buildCardPanel = new BuildCardPanel(this)
    this.interactionExecute = new InteractionExecute(this)
    this.inputCache = new Map()
  }
}
