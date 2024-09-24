import express from 'express'
import {
  Client as GenshinManager,
  EnkaManager,
  EnkaManagerError,
  EnkaNetworkError,
} from 'genshin-manager'

import { ScoringType } from '@/lib/buildCard'
import { BuildCard } from '@/lib/buildCard/parts'
import { PartsCreator } from '@/lib/imageCreator'

const app = express()

const port = process.env.PORT || 3000

const genshinManagerClient = new GenshinManager({
  defaultLanguage: 'JP',
  downloadLanguages: ['JP'],
  assetCacheFolderPath: './cache',
})
const enkaManager = new EnkaManager()

function startAPIServer(): void {
  app.get('/:uid/:index/:scoringType', (req, res) => {
    void (async (): Promise<void> => {
      if (!isScoreType(req.params.scoringType)) {
        res.status(400)
        res.header('Content-Type', 'application/json')
        res.send(
          JSON.stringify({
            message: 'scoringType must be one of ATK, DEF, HP, EM, ER',
          }),
        )
        return
      }
      try {
        const enkaData = await enkaManager.fetchAll(+req.params.uid)

        if (enkaData.characterDetails.length <= +req.params.index) {
          res.status(404)
          res.header('Content-Type', 'application/json')
          res.send(
            JSON.stringify({
              message: 'Character not found',
            }),
          )
          return
        }

        const buffer = await new PartsCreator().create(
          new BuildCard(
            enkaData.characterDetails[+req.params.index],
            req.params.uid,
            req.params.scoringType,
          ),
        )
        res.status(200)
        res.header('Content-Type', 'image/png')
        res.send(buffer)
      } catch (e) {
        if (e instanceof EnkaManagerError) {
          res.status(401)
          res.header('Content-Type', 'application/json')
          res.send(
            JSON.stringify({
              message: e.message,
            }),
          )
        }
        if (e instanceof EnkaNetworkError) {
          res.status(e.statusCode)
          res.header('Content-Type', 'application/json')
          res.send(
            JSON.stringify({
              message: e.message,
            }),
          )
        }
        throw e
      }
    })()
  })

  app.listen(port, () => {
    void (async (): Promise<void> => {
      await genshinManagerClient.deploy()
      console.log(`API Server is running on port ${port}`)
    })()
  })
}

function isScoreType(type: string): type is ScoringType {
  return ['ATK', 'DEF', 'HP', 'EM', 'ER'].includes(type)
}

void startAPIServer()
