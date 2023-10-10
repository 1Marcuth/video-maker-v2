import { fileURLToPath } from "url"
import { zip } from "zip-a-folder"
import path from "path"
import fs from "fs"

import { generateRandomCode } from "./random.js"

const modulePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(modulePath)

async function makePackage() {
    const newPackageDirPath = path.join(currentDirectory, "..", "content", "new-project")

    if (!fs.existsSync(newPackageDirPath)) {
        await fs.promises.mkdir(newPackageDirPath)
    }

    async function pack(title, deleteOriginalFolder = true) {
        console.log(`> [package-maker] Packing title video content '${title}'.`)

        const randomCodeLength = 8
        const randomCode = generateRandomCode(
            randomCodeLength,
            false,
            true,
            false
        )

        const sanitizedTitle = title
            .trim()
            .toLowerCase()
            .replace(/^a-zA-Z0-9]/g, "")
            .replace(/ +/g, "-")

        const packageFileName = `${sanitizedTitle}-${randomCode}.zip`
        const packageFilePath = path.join(currentDirectory, "..", "content", packageFileName)

        await zip(newPackageDirPath, packageFilePath, {
            compression: 9
        })

        if (deleteOriginalFolder) {
            await fs.promises.rm(newPackageDirPath, { recursive: true })
        }

        console.log(`> [package-maker] It has been successfully packaged into '${packageFilePath}'`)
    }

    return { pack }
}


export default makePackage