import imageDownloader from "image-downloader"
import { fileURLToPath } from "url"
import { google } from "googleapis"
import path from "path"
import fs from "fs"

import { apiKeys, googleSearchEngineId } from "../settings.js"
import { testCorrupted } from "../utils/image-utils.js"
import { choiceAtRandom } from "../utils/random.js"
import createLogger from "../utils/logger.js"
import state from "./state.js"

const customSearch = google.customsearch("v1")

const modulePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(modulePath)

export default (async () => {
    const logger = createLogger("image")
    const content = state.load()

    logger.log("Starting...")

    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)

    state.save(content)

    logger.log("Execution finished!")

    async function fetchImagesOfAllSentences(content) {
        for (
            let sentenceIndex = 0;
            sentenceIndex < content.sentences.length;
            sentenceIndex++
        ) {
            const keywords = content.sentences[sentenceIndex].keywords
            const searchTerm = content.searchTerm

            if (keywords.length > 0) {
                let query

                if (sentenceIndex === 0) {
                    query = `${searchTerm}`
                } else {
                    const randomKeyword = choiceAtRandom(keywords)

                    if (searchTerm.toLowerCase() !== randomKeyword.toLowerCase()) {
                        query = `${searchTerm} ${randomKeyword}`
                    } else {
                        for (let keywordIndex = 0; keywords.length; keywordIndex++) {
                            const currentKeyword = keywords[keywordIndex]
    
                            if (searchTerm.toLowerCase() !== currentKeyword.toLowerCase()) {
                                query = `${searchTerm} ${currentKeyword}`
                                break
                            }
                        }
    
                        if (!query) query = `${searchTerm} ${keywords[0]}`
                    }
                }

                content.sentences[sentenceIndex].images = await fetchGoogleAndReturnImagesLinks(query)
                content.sentences[sentenceIndex].googleSearchQuery = query
            } else {
                content.sentences[sentenceIndex].googleSearchQuery = null
            }
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        logger.log(`Querying Google Images with '${query}'...`)

        const response = await customSearch.cse.list({
            auth: apiKeys.googleSearch,
            cx: googleSearchEngineId,
            q: query,
            searchType: "image",
            num: 2
        })

        const imagesUrl = response.data.items.map(item => item.link)

        logger.log(`Got ${response.data.items.length} image links for query '${query}'!.`)

        return imagesUrl
    }

    async function downloadAllImages(content) {
        content.downlodedImages = []

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex]

                try {
                    if (content.downlodedImages.includes(imageUrl)) {
                        throw new Error(`The image '${imageUrl}' alreay downloaded!`)
                    }

                    const imageFilePath = await downloadAndSaveImage(imageUrl, `${sentenceIndex}.png`)
                    const isCorrupted = await testCorrupted(imageFilePath)

                    if (isCorrupted) {
                        throw new Error(`The image from '${imageUrl}' is corrupted!`)
                    }

                    content.downlodedImages.push(imageUrl)
                    
                    logger.log(`[${sentenceIndex}][${imageIndex}] Image successfully downloaded '${imageUrl}'.`)

                    break
                } catch(error) {
                    logger.error(`[${sentenceIndex}][${imageIndex}] Error when trying to download image '${imageUrl}'.`)
                    console.error(error)
                }
            }
        }
    }

    async function downloadAndSaveImage(url, fileName) {
        const imageDirPath = path.join(currentDirectory, "..", "content", "new-project", "images", "sentences", "original")
        const destFilePath = path.join(imageDirPath, fileName)

        if (!fs.existsSync(imageDirPath)) {
            await fs.promises.mkdir(imageDirPath, { recursive: true })
        }

        console.log(imageDirPath)
        console.log(destFilePath)

        await imageDownloader.image({
            url: url,
            dest: destFilePath
        })

        return destFilePath
    }
})