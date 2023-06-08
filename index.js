import makePackage from "./utils/package-maker.js"
import robots from "./robots/index.js"

(async () => {
    const pkg = await makePackage()

    robots.settings()
    await robots.input()
    await robots.text()
    await robots.image()
    await robots.audio()
    await robots.video()
    await robots.youtube()

    const content = robots.state.load()

    const title = `${content.prefix} ${content.searchTerm}`

    await pkg.pack(title)
})()