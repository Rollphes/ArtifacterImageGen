import { serve } from '@hono/node-server'
import {
  Client as GenshinManager,
  EnkaManager,
  EnkaManagerError,
  EnkaNetworkError,
} from 'genshin-manager'
import { Hono } from 'hono'

import { ScoringType } from '@/lib/buildCard'
import { BuildCard } from '@/lib/buildCard/parts'
import { PartsCreator } from '@/lib/imageCreator'

const app = new Hono()

const port = process.env.PORT || 3000

const genshinManagerClient = new GenshinManager({
  defaultLanguage: 'JP',
  downloadLanguages: ['JP'],
  assetCacheFolderPath: './cache',
})
const enkaManager = new EnkaManager()

function isScoreType(type: string): type is ScoringType {
  return ['ATK', 'DEF', 'HP', 'EM', 'ER'].includes(type)
}

app.get('/:uid/:index/:scoringType', async (c) => {
  const { uid, index, scoringType } = c.req.param()
  if (!isScoreType(scoringType)) {
    return new Response(
      JSON.stringify({
        message: 'scoringType must be one of ATK, DEF, HP, EM, ER',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
  try {
    const enkaData = await enkaManager.fetchAll(+uid)

    if (enkaData.characterDetails.length <= +index) {
      return new Response(
        JSON.stringify({
          message: 'Character not found',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    console.time('create')
    const buffer = await new PartsCreator().create(
      new BuildCard(enkaData.characterDetails[+index], uid, scoringType),
    )
    console.timeEnd('create')
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    })
  } catch (e) {
    if (e instanceof EnkaManagerError) {
      return new Response(
        JSON.stringify({
          message: e.message,
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
    if (e instanceof EnkaNetworkError) {
      return new Response(
        JSON.stringify({
          message: e.message,
        }),
        {
          status: e.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
    throw e
  }
})

async function startServer(): Promise<void> {
  await genshinManagerClient.deploy()
  serve({ fetch: app.fetch, port: +port })
  console.log(`API Server is running on port ${port}`)
}
void startServer()
