import GM from "gm"

const gm = GM.subClass({ imageMagick: true })

function testCorrupted(imagePath) {
    return new Promise((resolve, reject) => {
      gm(imagePath)
        .identify((error, data) => {
          if (error) return resolve(error)

          const isCorrupted = data && data.Properties && data.Properties.corrupt === "true"
          
          resolve(isCorrupted)
        })
    })
}

export { testCorrupted }