import googleTTS from "google-tts-api"
import path from "path"
import fs from "fs"

function createAudioFile(text, filePath, language = "en") {
    filePath = path.resolve(filePath)
  
    return new Promise(async (resolve, reject) => {
        const result = await googleTTS.getAllAudioBase64(text, { lang: language })

        const buffers = result.map(result => Buffer.from(result.base64, "base64"))
        const finalBuffer = Buffer.concat(buffers)

        fs.promises.writeFile(filePath, finalBuffer)

        return resolve(filePath)
    })
}

export default createAudioFile