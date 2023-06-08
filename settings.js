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
        credits: "Créditos",
        prefixes: {
            "The history of": "A história de",
            "Who is": "Quem é",
            "What is": "O que é"
        }
    },
    en: {
        credits: "Credits",
        prefixes: {
            "The history of": "The history of",
            "Who is": "Who is",
            "What is": "What is"
        }
    },
    es: {
        credits: "Creditos",
        prefixes: {
            "The history of": "La historia de",
            "Who is": "Quién es",
            "What is": "Qué es"
        }
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