import ffmpeg from "fluent-ffmpeg"

function composeAudios(outputFilePath, ...audioFilePaths) {
    return new Promise((resolve, reject) => {
        const audio = ffmpeg()
            .on("error", (error) => {
                console.log(error)
                return reject(
                    new Error(`Error composing the audios: ${error.message}`)
                )
            })
            .on("end", () => {
                return resolve()
            })
    
            for (let i = 0; i < audioFilePaths.length; i++) {
                audio.input(audioFilePaths[i])
            }
    
            audio.complexFilter(`[0:a][1:a]amix=inputs=${audioFilePaths.length}:duration=longest`)

        audio.save(outputFilePath)
    })
}

function mergeAudios(outputFilePath, ...audioFilePaths) {
    return new Promise((resolve, reject) => {
        const audio = ffmpeg()
            .on("error", (error) => {
                reject(
                    new Error(`Error when joining the audios: ${error.message}`)
                )
            })
            .on("end", () => {
                resolve()
            })

        for (const audioFilePath of audioFilePaths) {
            audio.input(audioFilePath)
        }
  
        audio.mergeToFile(outputFilePath)
    })
}
  
function changeAudioVolume(inputPath, volume, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(inputPath)
            .audioFilters(`volume=${volume}`)
            .on("error", (error) => {
                return reject(
                new Error(`Erro ao alterar o volume: ${error.message}`)
                )
            })
            .on("end", () => {
                return resolve()
            })
            .output(outputPath)
            .run()
    })
}

function cutAudio(inputPath, startTime, duration, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .on("error", (error) => {
            return reject(
                new Error(`Error cutting audio: ${error.message}`)
            )
        })
        .on("end", () => {
            return resolve("Audio successfully cut!")
        })
        .output(outputPath)
        .run()
    })
}

export {
    composeAudios,
    mergeAudios,
    changeAudioVolume,
    cutAudio
}