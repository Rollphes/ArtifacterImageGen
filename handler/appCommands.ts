import {
  ApplicationCommandData,
  ApplicationCommandType,
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Guild,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js'

type ExecuteTypes =
  | {
      type?: ApplicationCommandType.ChatInput
      execute: (
        interaction: ChatInputCommandInteraction<CacheType>,
      ) => Promise<void>
      autoComplete?: (
        interaction: AutocompleteInteraction<CacheType>,
      ) => Promise<void>
    }
  | {
      type: ApplicationCommandType.Message
      execute: (
        interaction: MessageContextMenuCommandInteraction<CacheType>,
      ) => Promise<void>
    }
  | {
      type: ApplicationCommandType.User
      execute: (
        interaction: UserContextMenuCommandInteraction<CacheType>,
      ) => Promise<void>
    }
interface ReplyConfig {
  /**
   * このコマンドの返信をephemeralにするか?
   * @default false
   */
  ephemeral?: boolean
  /**
   * deferReply事前実行するか?
   * @default true
   */
  deferReply?: boolean
}
export type CustomApplicationCommandData = ApplicationCommandData &
  ReplyConfig &
  ExecuteTypes

export const commandDatas: CustomApplicationCommandData[] = []
export default async (client: Client, guild: Guild): Promise<void> => {
  await guild.commands.set(commandDatas)
}
