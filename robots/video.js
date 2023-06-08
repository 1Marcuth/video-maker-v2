import videoshow from "videoshow/lib/index.js"
import { fileURLToPath } from "url"
import ProgressBar from "progress"
import Jimp from "jimp"
import path from "path"
import GM from "gm"
import fs from "fs"

const gm = GM.subClass({ imageMagick: true })

import { choiceAtRandom } from "../utils/random.js"
import createLogger from "../utils/logger.js"
import state from "./state.js"

const modulePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(modulePath)

export default (async () => {
    const logger = createLogger("video")
    const content = state.load()

    logger.log("Starting...")

    await convertAllImages(content)
    if (!content.dynamicCaption) await createAllSentenceImages(content)
    await createYouTubeThumbnail(content)
    await renderVideoWithVideoshow(content)
    
    state.save(content)

    logger.log("Execution finished!")

    async function convertAllImages(content) {
        logger.log("Converting and editing the original images...")

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            if (content.sentences[sentenceIndex].images.length > 0) {
                await convertImage(content, sentenceIndex)
            }
        }

        logger.log("Original images successfully converted and edited!")
    }

    async function deleteImage(imageFilePath) {
        logger.log(`Deleting image from path ${imageFilePath}`)

        await fs.promises.unlink(imageFilePath)

        logger.log(`Image from path '${imageFilePath}' it has been successfully deleted!`)
    }

    async function convertImage(content, sentenceIndex) {
        return new Promise(async (resolve, reject) => {
            const inputDirPath = path.join(currentDirectory, "..", "content", "new-project", "images", "sentences", "original")
            const outputDirPath = path.join(currentDirectory, "..", "content", "new-project", "images", "sentences", "converted")

            const inputFileName = `${sentenceIndex}.png`
            const outputFileName = `${sentenceIndex}.png`

            const inputFilePath = path.join(inputDirPath, inputFileName) 
            const outputFilePath = path.join(outputDirPath, outputFileName)

            if (!fs.existsSync(outputDirPath)) {
                await fs.promises.mkdir(outputDirPath, { recursive: true })
            }

            const width = 1920
            const height = 1030

            gm()
                .in(inputFilePath)
                .out("(")
                .out("-clone")
                .out("0")
                .out("-background", "white")
                .out("-blur", "0x9")
                .out("-resize", `${width}x${height}^`)
                .out(")")
                .out("(")
                .out("-clone")
                .out("0")
                .out("-background", "white")
                .out("-resize", `${width}x${height}`)
                .out(")")
                .out("-delete", "0")
                .out("-gravity", "center")
                .out("-compose", "over")
                .out("-composite")
                .out("-extent", `${width}x${height}`)
                .resize(width, height)
                .write(outputFilePath, async (error) => {
                    if (error) {
                        logger.error(`Error when trying to convert the image: ${inputFilePath}`)
                        logger.log(`Dropping image: ${inputFilePath}`)

                        await deleteImage(inputFilePath)

                        content.sentences.splice(sentenceIndex, 1)

                        return resolve()
                    }

                    logger.log(`Image converted: ${outputFilePath}`)

                    return resolve()
                })
        })
    }
    
    async function createAllSentenceImages(content) {
        logger.log("Creating images of the sentences...")

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
        }

        logger.log("Images of the sentences were created successfully!")
    }
    
    async function createSentenceImage(sentenceIndex, sentenceText) {
        return new Promise(async (resolve, reject) => {
            const inputDirPath = path.join(currentDirectory, "..", "content", "new-project", "images", "sentences", "converted")
            const outputDirPath = path.join(currentDirectory, "..", "content", "new-project", "images", "sentences", "captions")

            const inputFileName = `${sentenceIndex}.png`
            const outputFileName = `${sentenceIndex}.png`

            const inputFilePath = path.join(inputDirPath, inputFileName) 
            const outputFilePath = path.join(outputDirPath, outputFileName)

            if (!fs.existsSync(outputDirPath)) {
                await fs.promises.mkdir(outputDirPath)
            }

            const templateSettings = {
                0: {
                    size: "1920x400",
                    gravity: "center"
                },
                1: {
                    size: "1920x1080",
                    gravity: "center"
                },
                2: {
                    size: "800x1080",
                    gravity: "west"
                },
                3: {
                    size: "1920x400",
                    gravity: "center"
                },
                4: {
                    size: "1920x1080",
                    gravity: "center"
                },
                5: {
                    size: "800x1080",
                    gravity: "west"
                },
                6: {
                    size: "1920x400",
                    gravity: "center"
                }

            }

            let templateSetting

            const templateSettingKeys = Object.keys(templateSettings)
            const templateSettingLength = templateSettingKeys.length

            if (sentenceIndex + 1 > templateSettingLength) {
                const randomKey = choiceAtRandom(templateSettingKeys)
                templateSetting = templateSettings[randomKey]
            } else {
                templateSetting = templateSettings[sentenceIndex]
            }

            gm()
                .out("-size", templateSetting.size)
                .out("-gravity", templateSetting.gravity)
                .out("-background", "transparent")
                .out("-fill", "white")
                .out("-kerning", "-1")
                .out(`caption:${sentenceText}`)
                .write(outputFilePath, async (error) => {
                    if (error) return reject(error)

                    logger.log(`Sentence text created: ${outputFilePath}`)

                    const imageUnderneath = await Jimp.read(inputFilePath)
                    const imageAbove = await Jimp.read(outputFilePath)

                    imageUnderneath.scan(
                        0, 0,
                        imageUnderneath.bitmap.width,
                        imageUnderneath.bitmap.height,
                        (x, y, idx) => {
                            const r = imageUnderneath.bitmap.data[idx + 0]
                            const g = imageUnderneath.bitmap.data[idx + 1]
                            const b = imageUnderneath.bitmap.data[idx + 2]
                    
                            const darkR = Math.floor(r * 0.7)
                            const darkG = Math.floor(g * 0.7)
                            const darkB = Math.floor(b * 0.7)

                            imageUnderneath.bitmap.data[idx + 0] = darkR
                            imageUnderneath.bitmap.data[idx + 1] = darkG
                            imageUnderneath.bitmap.data[idx + 2] = darkB
                        })
                    
                    imageUnderneath.composite(imageAbove, 0, 0)
                    await imageUnderneath.writeAsync(outputFilePath)

                    logger.log(`Sentence created: ${outputFilePath}`)

                    return resolve()
                })
            })
    }

    function getFirstImagePath(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            if (content.sentences[sentenceIndex].images.length > 0) {
                const filePath = path.join(currentDirectory, "..", "content", "new-project", "images", "sentences", "converted", `${sentenceIndex}.png`)
                return filePath
            }
        }
    }

    async function createYouTubeThumbnail(content) {
        return new Promise((resolve, reject) => {
            logger.log("Creating thumbnail for YouTube video...")

            const firstImage = getFirstImagePath(content)
            const outputFilePath = path.join(currentDirectory, "..", "content", "new-project", "images", "youtube-thumbnail.jpg")

            gm()
                .in(firstImage)
                .write(outputFilePath, (error) => {
                    if (error) return reject(error)
                    logger.log("YouTube thumbnail created as successfully!")
                    return resolve()
                })
        })
    }

    async function renderVideoWithVideoshow(content) {
        return new Promise((resolve, reject) => {
            logger.log("Rendering video with Videoshow...")

            const outputVideoFilePath = path.join(currentDirectory, "..", "content", "new-project", "video.mp4")

            let images = []

            let videoDuration = 0

            for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
                const sentence = content.sentences[sentenceIndex]

                if (sentence.images.length > 0) {
                    const imageFilePath = path.join(currentDirectory, "..", "content", "new-project", "images", "sentences", content.dynamicCaption ? "converted" : "captions", `${sentenceIndex}.png`)
                    images.push({ path: imageFilePath })
                }

                videoDuration += sentence.duration
            }

            const loopDuration = Math.ceil(videoDuration / content.sentences.length)

            const videoOptions = {
                fps: 25,
                loop: loopDuration,
                transition: true,
                transitionDuration: 1.5,
                videoBitrate: 1024,
                videoCodec: "libx264",
                size: "1920x1030",
                audioBitrate: "128k",
                audioChannels: 2,
                format: "mp4",
                pixelFormat: "yuv420p",
                useSubRipSubtitles: false
            }

            if (content.dynamicCaption) {
                videoOptions.subtitleStyle = {
                    Fontname: "Poppins Black",
                    Fontsize: "52",
                    PrimaryColour: "16777215",
                    SecondaryColour: "16777215",
                    TertiaryColour: "16777215",
                    BackColour: "-2147483640",
                    Bold: "2",
                    Italic: "0",
                    BorderStyle: "1",
                    Outline: "0",
                    Shadow: "0",
                    Alignment: "1",
                    MarginL: "40",
                    MarginR: "60",
                    MarginV: "40"
                }

                for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
                    const sentence = content.sentences[sentenceIndex]
                    images[sentenceIndex].caption = sentence.text
                }
            }

            const bar = new ProgressBar("Video rendering progress [:bar] :percent :etas", {
                total: 100,
                width: 30,
                complete: "▓",
                incomplete: "▒",
            })

            let alreadyFinishedTheFirstPart = false

            videoshow(images, videoOptions)
                .audio(content.manipuledMusicFilePath)
                .audio(content.speechAudioFilePath)
                .save(outputVideoFilePath)
                    .on("start", (command) => {
                        logger.log(`ffmpeg process started:${command}`)
                    })
                    .on("progress", (progress) => {
                        if (bar.curr >= 72 && !alreadyFinishedTheFirstPart) {
                            bar.tick(0)
                            alreadyFinishedTheFirstPart = true
                        }
                        
                        if (bar.curr === 100) return

                        bar.tick(progress)
                    })
                    .on("error", (error, stdout, stderr) => {
                        logger.error(error)
                        logger.error(`ffmpeg stderr: ${stderr}`)
                        return reject(error)
                    })
                    .on("end", (output) => {
                        logger.log(`Rendering done: ${output}`)
                        return resolve()
                    })
        })
    }
})