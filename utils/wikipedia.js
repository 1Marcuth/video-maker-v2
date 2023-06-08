import wiki from "wikipedia"

async function getContentFromWikipedia(pageName, language) {
    wiki.setLang(language)

    const page = await wiki.page(pageName)

    const content = {
        content: await page.content(),
        images: await page.images(),
        links: await page.links(),
        pageid: page.pageid,
        references: await page.references(),
        summary: await page.summary(),
        title: page.title,
        url: page.fullurl
    }

    return content
}

export default getContentFromWikipedia