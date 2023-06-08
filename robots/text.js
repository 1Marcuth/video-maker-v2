import { Configuration, OpenAIApi } from "openai"
import sentenceBoundaryDetection from "sbd"

import { apiKeys, languagesSettings, openaiModel } from "../settings.js"
import extractKeywords from "../utils/keyword-extractor.js"
import createLogger from "../utils/logger.js"
import getContentFromWikipedia from "../utils/wikipedia.js"

import state from "./state.js"

export default (async () => {
    const logger = createLogger("text")
    const content = state.load()

    logger.log("Starting...")
    
    if (content.contentProvider === "chatgpt") {
        await fetchChatGPTContent(content)
        sanitizeChatGPTContent(content)
        breakContentIntoSentencesV1(content)
    } else if (content.contentProvider === "wikipedia") {
        await fetchWikipediaContent(content)
        sanitizeWikipediaContent(content)
        breakContentIntoSentencesV2(content)
    }

    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    logger.log("Execution finished!")

    async function fetchChatGPTContent(content) {
        logger.log("Fetching content from ChatGPT...")

        const configuration = new Configuration({ apiKey: apiKeys.openai })
        
        const languageFullName = languagesSettings[content.language].language
        const openai = new OpenAIApi(configuration)
        const prompt = `Make a text of ${content.maximumSentences} long sentences (without enumeration) about '${content.prefix} ${content.searchTerm}' in language ${languageFullName}:`
        
        const completion = await openai.createCompletion({
            model: openaiModel,
            prompt: prompt,
            n: 1,
            stop: null,
            temperature: 1,
            max_tokens: 3900
        })

        const data = completion.data

        const textResult = data.choices
            .filter(choice => choice.text)
            .map(choice => choice.text)
            .join("\n")
            .trim()

        content.sourceContentOriginal = textResult

        logger.log("Content with ChatGPT was successfully fetched!")
    }

    async function fetchWikipediaContent(content) {
        logger.log("Fetching content from Wikipedia...")

        const pageData = await getContentFromWikipedia(content.searchTerm)
        content.sourceContentOriginal = pageData.content

        logger.log("Content with Wikipedia was successfully fetched!")
    }

    function sanitizeChatGPTContent(content) {
        logger.log("Sanitizing ChatGPT content...")

        const withoutEnumerationNumbers = removeEnumerationNumbers(content.sourceContentOriginal)

        content.sourceContentSanitized = withoutEnumerationNumbers

        function removeEnumerationNumbers(text) {
            return text.replace(/^\d+\. /gm, "")
        }

        logger.log("ChatGPT content successfully sanitized!")
    }

    function sanitizeWikipediaContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split("\n")

            const withoutBlankLinesandMarkdown = allLines.filter(line => {
                if (line.trim().length !== 0 || !line.trim().startsWith("=")) return true
            })

            return withoutBlankLinesandMarkdown.join(" ")
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /g," ")
        }
    }

    function breakContentIntoSentencesV1() {
        logger.log("Trying to break sentences with the 'V1' sentence breaker...")

        content.sentences = []
        
        const sentences = content.sourceContentSanitized
            .split("\n")
            .map(sentence => sentence.trim())

        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })

        const minSentences = content.maximumSentences - 2

        if (content.sentences.length < minSentences) {
            logger.log(`Trying to break sentences with V2 because V1 generated only ${sentences.length} sentences!`)

            breakContentIntoSentencesV2()

            logger.log(`Obtained ${content.sentences.length} sentences with V2 sentence breaker!`)
        } else {
            logger.log(`Obtained ${sentences.length} sentences with V1 sentence breaker!`)
        }
    }

    function breakContentIntoSentencesV2(content) {
        logger.log("Trying to break sentences with the 'V2' sentence breaker...")

        content.sentences = []
        
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)

        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })

        logger.log(`${content.sentences.length} sentences were obtained!`)
    }

    function limitMaximumSentences(content) {
        logger.log(`Limiting sentences from ${content.sentences.length} to ${content.maximumSentences}...`)

        content.sentences = content.sentences.slice(0, content.maximumSentences)

        logger.log("Okay, the number of sentences has been limited!")
    }

    async function fetchKeywordsOfAllSentences() {
        logger.log("Starting to fetch keywords from Keyword Extractor...")

        for (const sentence of content.sentences) {
            sentence.keywords = await extractKeywords(sentence.text)

            if (sentence.keywords.length > 0) {
                logger.log(`Keywords '${sentence.keywords.join(", ")}'.`)
            }
        }

        logger.log("Keyword search and extraction completed successfully!")
    }
})