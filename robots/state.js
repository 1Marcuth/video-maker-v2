import { fileURLToPath } from "url"
import path from "path"
import fs from "fs"

const modulePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(modulePath)

const contentFilePath = path.join(currentDirectory, "..", "content", "new-project", "content.json")

function save(content) {
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

function load() {
    const fileBuffer = fs.readFileSync(contentFilePath, { encoding: "utf-8" })
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

export default { save, load }