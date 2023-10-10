import readline from "readline-sync"

import { contentProviders, languages, defaultSettings, text2speechProviders } from "../settings.js"
import state from "./state.js"

export default (() => {
    let content = {}

    const wantToSetUp = askWantToSetUp()

    if (wantToSetUp) {
        content.language = askAndReturnLanguage()
        content.contentProvider = askAndReturnContentProvider()
        content.maximumSentences = askAndReturnMaximumSentences()
        content.text2speechProvider = askAndReturnText2speechProvider()
        content.dynamicCaption = askAndReturnIfWantToUseDynamicCaption()
    } else {
        content = Object.assign(content, defaultSettings)
    }

    state.save(content)

    function askWantToSetUp() {
        const answers = ["To set up", "Keep settings"]
        const answerIndex = readline.keyInSelect(answers, "Do you want to set up or keep the default settings? ")
        return answerIndex === 0
    }

    function askAndReturnLanguage() {
        const languageIndex = readline.keyInSelect(languages, "Choose one language: ")
        const language = languages[languageIndex]
        return language
    }

    function askAndReturnContentProvider() {
        const selectedContentProviderIndex = readline.keyInSelect(contentProviders, "Choose one content provider: ")
        const selectedContentProviderText = contentProviders[selectedContentProviderIndex].toLowerCase()
        return selectedContentProviderText
    }

    function askAndReturnMaximumSentences() {
        const maximumSentences = readline.questionInt("What is the maximum number of sentences? ")
        return maximumSentences
    }

    function askAndReturnText2speechProvider() {
        const selectedText2speechProviderIndex = readline.keyInSelect(text2speechProviders, "Choose one content provider: ")
        const selectedText2speechProviderText = text2speechProviders[selectedText2speechProviderIndex].toLowerCase()
        return selectedText2speechProviderText
    }

    function askAndReturnIfWantToUseDynamicCaption() {
        const wantToUseDynamicCaption = readline.keyInYN("Want to use dynamic caption? ")
        return wantToUseDynamicCaption
    }
})