import { google } from "googleapis"
import { fileURLToPath } from "url"
import ProgressBar from "progress"
import express from "express"
import path from "path"
import fs from "fs"

import createLogger from "../utils/logger.js"
import { runningIn, translations } from "../settings.js"
import state from "./state.js"
import { exec } from "child_process"

const OAuth2 = google.auth.OAuth2
const youtube = google.youtube({ version: "v3" })

const modulePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(modulePath)

export default (async () => {
    const logger = createLogger("youtube")
    const content = state.load()

    logger.log("Starting...")

    await authenticateWithOAuth()
    const videoInformation = await uploadVideo(content)
    await uploadThumbnail(videoInformation)

    state.save(content)

    logger.log("Execution finished!")

    async function authenticateWithOAuth() {
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthClient()
        await requestUserConsent(OAuthClient)
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
        await setGlobalGoogleAuthentication(OAuthClient)
        await stopWebServer(webServer)

        async function startWebServer() {
            return new Promise((resolve, reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () => {
                    logger.log(`Server listening on http://localhost:${port}/`)
                    return resolve({ app, server })
                })
            })
        }

        async function createOAuthClient() {
            const credentials = JSON.parse(
                await fs.promises.readFile("credentials/google-youtube.json")
            )

            const OAuthClient = new OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0]
            )

            return OAuthClient
        }

        async function requestUserConsent(OAuthClient) {
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: "offline",
                scope: ["https://www.googleapis.com/auth/youtube"]
            })
    
            logger.log(`Please give your consent: ${consentUrl}`)

            if (runningIn === "local") {
                const platform = process.platform

                try {
                    if (platform === "linux") {
                        exec(`xdg-open ${consentUrl}`)
                    } else if (platform === "win32") {
                        exec(`start ${consentUrl}`)
                    } else if (platform === "darwin") {
                        exec(`open ${consentUrl}`)
                    } else {
                        logger.error("Unable to open the url, please try clicking or copying the url and opening it in your browser!")
                    }
                } catch(error) {
                    logger.error(`An error occurred when trying to execute the command to open the url in your browser, please try clicking or copying the url and opening it in your browser! Error: ${error.message}`)
                }
            }
        }
    
        async function waitForGoogleCallback(webServer) {
            return new Promise((resolve, reject) => {
                logger.log("Wating for user consent...")
    
                webServer.app.get("/oauth2callback", (req, res) => {
                    const authCode = req.query.code
                    res.send("<h1>Obrigado!</h1><p>Você autorizou a aplicação. Agora você pode fechar essa aba.</p>")
                    return resolve(authCode)
                })
            })
        }

        async function requestGoogleForAccessTokens(OAuthClient, authorizationToken) {
            return new Promise((resolve, reject) => {
                OAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if (error) return reject(error)
                    logger.log("Access tokens received!")
                    OAuthClient.setCredentials(tokens)
                    return resolve()
                })
            })
        }

        async function setGlobalGoogleAuthentication(OAuthClient) {
            google.options({ auth: OAuthClient })
        }

        async function stopWebServer(webServer) {
            return new Promise((resolve, reject) => {
                webServer.server.close(() => resolve())
            })
        }
    }

    async function uploadVideo(content) {
        const videoFilePath = path.join(currentDirectory, "..", "content", "new-project", "video.mp4")
        const videoFileSize = (await fs.promises.stat(videoFilePath)).size
        const videoTitle = `${translations[content.language].prefixes[content.prefix]} ${content.searchTerm}`
        const videoTags = [content.searchTerm, ...content.sentences[0].keywords]
        const sentences = content.sentences.map(sentence => sentence.text).join("\n\n")
        const credits = content.downlodedImages.join("- \n")
        const creditsTitle = translations[content.language]["credits"]
        const videoDescription = `${sentences}\n\n${creditsTitle}:\n${credits}`

        const requestParameters = {
            part: "snippet, status",
            requestBody: {
                snippet: {
                    title: videoTitle,
                    description: videoDescription,
                    tags: videoTags
                },
                status: {
                    privacyStatus: "public"
                }
            },
            media: {
                body: fs.createReadStream(videoFilePath)
            }
        }

        const options = { onUploadProgress: onUploadProgress }

        logger.log("Starting to upload the video to YouTube.")

        const bar = new ProgressBar("Video upload progress [:bar] :percent :etas", {
            total: 100,
            width: 30,
            complete: "▓",
            incomplete: "▒",
        })

        const youtubeResponse = await youtube.videos.insert(requestParameters, options)

        const videoId = youtubeResponse.data.id
        const videoUrl = `https://youtu.be/${videoId}`

        content.youtube = {
            video: {
                id: videoId,
                url: videoUrl
            }
        }

        logger.log(`Video available at: ${videoUrl}`)

        return youtubeResponse.data

        function onUploadProgress(event) {
            const progress = Math.floor((event.bytesRead / videoFileSize) * 100)
            if (progress > 100) return
            bar.tick(progress)
        }
    }

    async function uploadThumbnail(videoInformation) {
        const videoId = videoInformation.id
        const videoThumbnailFilePath = path.join(currentDirectory, "..", "content", "new-project", "images", "youtube-thumbnail.jpg")

        const requestParameters = {
            videoId: videoId,
            media: {
                mediaType: "image/jpeg",
                body: fs.createReadStream(videoThumbnailFilePath)
            }
        }

        await youtube.thumbnails.set(requestParameters)

        console.log("> [youtube-robot] Thumbnail uploaded!")
    }
})