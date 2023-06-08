import dotenv from "dotenv"

dotenv.config()

const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID
const runningIn = process.env.RUNNING_IN

const apiKeys = {
    openai: process.env.OPENAI_KEY,
    rapidapi: process.env.RAPIDAPI_KEY,
    googleSearch: process.env.GOOGLE_SEARCH_KEY
}

const languagesSettings = {
    pt: {
        language: "portuguese",
        regionCode: "BR"
    },
    en: {
        language: "english",
        regionCode: "US"
    },
    es: {
        language: "spanish",
        regionCode: "ES"
    }
}

const languages = Object.keys(languagesSettings)
const contentProviders = ["Wikipedia", "ChatGPT"]
const openaiModel = "text-davinci-003"

const translations = {
    pt: {
        credits: "Créditos"
    },
    en: {
        credits: "Credits"
    },
    es: {
        credits: "Creditos"
    }
}

const defaultSettings = {
    contentProvider: "wikipedia",
    maximumSentences: 7,
    language: "pt",
    dynamicCaption: false
}

export {
    apiKeys,
    languages,
    runningIn,
    openaiModel,
    translations,
    defaultSettings,
    contentProviders,
    languagesSettings,
    googleSearchEngineId
}