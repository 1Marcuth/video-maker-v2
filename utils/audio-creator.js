import googleTTS from "google-tts-api"
import AWS from "aws-sdk"
import path from "path"
import fs from "fs"

import { awsAccessKeyId, awsRegion, awsSecretAccessKey } from "../settings.js"

AWS.config.update({
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
    region: awsRegion
})

const Polly = new AWS.Polly()

function createAudioFileWithGoogleTTS(text, filePath, language = "en") {
    filePath = path.resolve(filePath)

    return new Promise(async (resolve, reject) => {
        const result = await googleTTS.getAllAudioBase64(text, { lang: language })

        const buffers = result.map(result => Buffer.from(result.base64, "base64"))
        const finalBuffer = Buffer.concat(buffers)

        fs.promises.writeFile(filePath, finalBuffer)

        return resolve(filePath)
    })
}

function createAudioFileWithAWSPolly(text, filePath, language = "en") {
    const params = {
        Text: text,
        OutputFormat: "mp3",
        VoiceId: getAWSPollyVoiceId(language)
    }

    return new Promise((resolve, reject) => {
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                console.error("Error when synthesizing speech:", err)
                return reject(err)
            }

            fs.writeFile(filePath, data.AudioStream, "binary", (writeErr) => {
                if (writeErr) {
                    console.error("Error writing audio file:", writeErr)
                    reject(writeErr)
                } else {
                    console.log("Audio file created successfully:", filePath)
                    resolve(filePath)
                }
            })
        })
    })
}

function getAWSPollyVoiceId(language) {
    const languageMap = {
        en: "Joanna",
        pt: "Camila",
        es: "Lucia"
    }

    return languageMap[language] || "Joanna"
}

export {
    createAudioFileWithGoogleTTS,
    createAudioFileWithAWSPolly
}