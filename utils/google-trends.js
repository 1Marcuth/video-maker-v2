import axios from "axios"

import { apiKeys } from "../settings.js"

async function getGoogleTrends(regionCode) {
    const currentDate = new Date()
    const currentDay = String(currentDate.getDate()).padStart(2, "0")
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0")
    const currentYear = currentDate.getFullYear()
    const today = `${currentYear}-${currentMonth}-${currentDay}`

    const response = await getResponse(regionCode)
    const data = response.data

    return data

    async function getResponse(regionCode) {
        const options = {
            method: "GET",
            url: "https://google-trends8.p.rapidapi.com/trendings",
            params: {
                region_code: regionCode,
                date: today,
                hl: "en-US"
            },
            headers: {
                "X-RapidAPI-Key": apiKeys.rapidapi,
                "X-RapidAPI-Host": "google-trends8.p.rapidapi.com"
            }
        }
        
        const response = await axios.request(options)

        return response
    }
}

export default getGoogleTrends