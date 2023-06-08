import axios from "axios"

import { apiKeys } from "../settings.js"

async function extractKeywords(text) {
    const response = await getResponse(text)
    const data = response.data
    const keywords = getKeywords(data)

    return keywords

    async function getResponse(text) {
        const options = {
            method: "POST",
            url: "https://keyword-extractor.p.rapidapi.com/api/keyword",
            headers: {
              "content-type": "application/json",
              "X-RapidAPI-Key": apiKeys.rapidapi,
              "X-RapidAPI-Host": "keyword-extractor.p.rapidapi.com"
            },
            data: {
                text: text,
                top_n: 5,
                ngram_range: [1, 2],
                diversify: false,
                diversity: 0
            }
        }
    
        const response = axios.request(options)

        return response
    }

    async function getKeywords(data) {
        const keyords = Object.keys(data.result)
        return keyords
    }
}

export default extractKeywords