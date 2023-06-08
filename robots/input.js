import readline from "readline-sync"

import getGoogleTrends from "../utils/google-trends.js"
import { choiceAtRandom } from "../utils/random.js"
import { languagesSettings } from "../settings.js"
import state from "./state.js"

export default (async () => {
    const content = state.load()

    content.searchTerm = await askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    state.save(content)

    async function askAndReturnSearchTerm() {
        const suggestResearchTerm = readline.keyInYN("Suggest research term? ")

        if (suggestResearchTerm) {
            const { regionCode } = languagesSettings[content.language]

            const data = await getGoogleTrends(regionCode)
            const trends = data.items.map(item => item.query)

            const searchTermsOptions = [...trends, "Random"]
            let selectedSearchTermIndex = readline.keyInSelect(searchTermsOptions, "Choose one search term: ")
            let selectedSearchTerm = searchTermsOptions[selectedSearchTermIndex]

            if (selectedSearchTerm === "Random") {
                selectedSearchTerm = choiceAtRandom(trends)
            }

            return selectedSearchTerm
        }

        return readline.question("Type a search term: ")
    }

    function askAndReturnPrefix() {
        const prefixes = ["Who is", "What is", "The history of"]
        const selectedPrefixIndex = readline.keyInSelect(prefixes, "Choose one prefix: ")
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
    }
})