import wiki from "wikipedia"

async function getContentFromWikipedia(pageName) {
    const pageContent = {}

    const page = await wiki.page(pageName)

    pageContent.content = await page.content()
    pageContent.images = await page.images()
    pageContent.links = await page.links()
    pageContent.pageid = page.pageid
    pageContent.references = await page.references()
    pageContent.summary = await page.summary()
    pageContent.title = page.title
    pageContent.url = page.fullurl

    return pageContent
}

export default getContentFromWikipedia