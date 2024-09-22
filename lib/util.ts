import {
  Channel,
  ChannelType,
  Client,
  Message,
  MessageManager,
  PublicThreadChannel,
  TextChannel,
} from 'discord.js'

export async function findGuildTextChannel(
  client: Client,
  channelId: string,
): Promise<TextChannel | PublicThreadChannel<boolean> | undefined> {
  const channel = await (async (): Promise<Channel | null | void> => {
    return await client.channels.fetch(channelId).catch(() => {})
  })()
  if (!channel) return
  if (
    channel.type === ChannelType.GuildText ||
    channel.type === ChannelType.GuildPublicThread
  )
    return channel
  return
}

export async function getFirstMessage(
  messages: MessageManager,
): Promise<Message | undefined> {
  return (
    await messages.fetch({
      after: '0',
      limit: 1,
    })
  ).first()
}

const envList = {
  BUILD_CHANNEL_ID: process.env.build_channel,
  BOT_TOKEN: process.env.BOT_TOKEN,
}
function checkEnv(): void {
  console.log('---check environment variables---')
  const missingEnvKeys = Object.entries(envList)
    .map(([key, value]) => {
      if (!value) return key
      return undefined
    })
    .filter((key): key is string => key !== undefined)
  if (missingEnvKeys.length) {
    console.error(`Missing environment variables: ${missingEnvKeys.join(', ')}`)
    process.exit(1)
  }
  console.log('Success to check environment variables!!')
}
checkEnv()
export const env = Object.fromEntries(
  Object.entries(envList).map(([key, value]) => [key, value as string]),
) as { [key in keyof typeof envList]: string }
