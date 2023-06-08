import { fileURLToPath } from "url"
import ffmpeg from "fluent-ffmpeg"
import path from "path"
import fs from "fs"

import { mergeAudios, changeAudioVolume, composeAudios, cutAudio } from "../utils/audio-editor.js"
import createAudioFile from "../utils/audio-creator.js"
import { choiceAtRandom } from "../utils/random.js"
import createLogger from "../utils/logger.js"
import state from "./state.js"

const modulePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(modulePath)

export default (async () => {
    const logger = createLogger("audio")
    const content = state.load()

    logger.log("Starting...")

    await createSpeechAudioForSentences(content)
    await createSpeechAudioForVideo(content)
    await chooseAndManipulateMusic(content)
    await joinMusicWithSpeechAudio(content)

    state.save(content)

    logger.log("Execution finished!")

    async function createSpeechAudioForSentences(content) {
        logger.log("Creating voice speech for sentences...")

        const sentences = content.sentences

        for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
            const sentenceText = sentences[sentenceIndex].text
            content.sentences[sentenceIndex].audioFilePath = await createSpeechAudioForSentence(sentenceIndex, sentenceText)
            content.sentences[sentenceIndex].duration = await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(content.sentences[sentenceIndex].audioFilePath, (error, metadata) => {
                    if (error) return reject(error)
                    return resolve(metadata.format.duration)
                })
            })
        }

        async function createSpeechAudioForSentence(sentenceIndex, sentenceText) {
            logger.log(`Creating speech audio for the index sentence: ${sentenceIndex}...`)

            const outputDirPath = path.join(currentDirectory, "..", "content", "new-project", "audios", "sentences")
            if (!fs.existsSync(outputDirPath)) await fs.promises.mkdir(outputDirPath, { recursive: true })
            const outputFileName = `${sentenceIndex}.mp3`
            const outputFilePath = path.join(outputDirPath, outputFileName)
            await createAudioFile(sentenceText, outputFilePath, content.language)

            logger.log(`Speech audio for the index sentence ${sentenceIndex} created as successfully!`)

            return outputFilePath
        }

        logger.log("Creation of the sentence audios was done successfully!")
    }

    async function createSpeechAudioForVideo(content) {
        logger.log("Putting together audio excerpts from the sentences...")

        const audioFilePaths = []

        for (const sentence of content.sentences) {
            audioFilePaths.push(sentence.audioFilePath)
        }

        const speechAudioFileName = "full-speech-audio.mp3"
        content.speechAudioFilePath = path.join(currentDirectory, "..", "content", "new-project", "audios", speechAudioFileName)

        await mergeAudios(content.speechAudioFilePath, ...audioFilePaths)

        logger.log("Merge of the audios of the sentences done successfully!")
    }

    async function chooseAndManipulateMusic(content) {
        logger.log("Choosing, manipulating and adjusting video music.")

        await chooseAMusic(content)
        await manipuleAMusic(content)

        async function chooseAMusic(content) {
            logger.log("Choosing a song randomly...")

            const musicsDirPath = path.resolve("assets/audios/musics")
            const musicFileNames = await fs.promises.readdir(musicsDirPath)
            const musicFilePaths = musicFileNames.map(musicFileName => path.join(musicsDirPath, musicFileName))
            content.originalMusicFilePath = choiceAtRandom(musicFilePaths)

            logger.log(`Chosen music: ${path.basename(content.originalMusicFilePath)}`)
        }

        async function manipuleAMusic(content) {
            logger.log("Manipulating and adjusting the music...")

            content.manipuledMusicFilePath = path.join(currentDirectory, "..", "content/new-project/audios", "music.mp3")
            await changeAudioVolume(content.originalMusicFilePath, .05, content.manipuledMusicFilePath)

            logger.log("Music set successfully!")
        }
    }

    async function joinMusicWithSpeechAudio(content) {
        logger.log("Merging music with video voice and removing excess music...")

        const outputAudioWithMusicBurrFilePath = path.join(currentDirectory, "..", "content/new-project/audios", "video-audio-with-music-burr.mp3")
        const outputAudioFilePath = path.join(currentDirectory, "..", "content/new-project/audios", "video-audio.mp3")

        const speechAudioDuration = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(content.speechAudioFilePath, (error, metadata) => {
                if (error) reject(error)
                return resolve(
                    Math.ceil(metadata.format.duration)
                )
            })
        })
        
        await joinAudios(content)
        await removeRemainingMusic()

        async function joinAudios(content) {
            logger.log("Merging music with video voice...")

            await composeAudios(
                outputAudioWithMusicBurrFilePath,
                content.speechAudioFilePath,
                content.manipuledMusicFilePath
            )
            
            logger.log("Merge successful!")
        }

        async function removeRemainingMusic() {
            logger.log("Cutting out part of the excess music...")

            await cutAudio(
                outputAudioWithMusicBurrFilePath,
                0,
                speechAudioDuration,
                outputAudioFilePath
            )

            logger.log("Successfully cut!")
        }
    }
})