import fs from 'fs'
import { readFile, writeFile } from 'fs/promises'
import fetch from 'node-fetch'

import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'

export const fetchImage = async (imagePath: string, url: string) => {
  if (fs.existsSync(imagePath)) {
    return await readFile(imagePath)
  } else {
    const res = await fetch(url)
    if (!res.ok) {
      console.log(url)
      throw new EnkaManagerjsError('APIError', 'Unable to retrieve image.')
    }
    const arrayBuffer = await res.arrayBuffer()
    const data = Buffer.from(arrayBuffer)
    await writeFile(imagePath, data, { flag: 'w' })
    return data
  }
}
