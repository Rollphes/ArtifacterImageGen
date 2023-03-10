if (
  process.env.BOT_TOKEN === undefined ||
  process.env.build_channel === undefined
) {
  throw Error('環境変数を設定してください')
}

import { ActivityType, ClientOptions, Partials } from 'discord.js'
import { Agent } from 'undici'

import { deployCommands } from '@/handler'
import Client from '@/lib/Client'
import packageJson from '@/package.json'
const BOT_TOKEN = process.env.BOT_TOKEN

const options: ClientOptions = {
  intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers'],
  partials: [Partials.Channel],
  waitGuildTimeout: 60000,
}

const client = new Client(options)

const agent = new Agent({
  connect: {
    timeout: 60000,
  },
})
client.rest.setAgent(agent)

client.on('interactionCreate', async (interaction) => {
  await interaction.client.interactionExecute.run(interaction)
})

client.on('ready', async () => {
  console.log('[1/2]deploy application module...')
  if (!client.application?.owner) await client.application?.fetch()
  for (const [, guild] of client.guilds.cache) {
    await deployCommands(client, guild)
  }

  console.log('[2/2]deploy panel module...')
  client.enkaNetwork.deploy()
  await client.buildCardPanel.deploy()

  client.user?.edit({})
  client.user?.setActivity(
    `BOTが正常に起動したよ！(Ver: ${packageJson.version})`,
    {
      type: ActivityType.Playing,
    }
  )
  console.log('botを正常に起動しました')
})

void client.login(BOT_TOKEN)
