const lowerLetters = "abcdefghijklmnopqrstuvwxyz"
const upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const digits = "0123456789"
const specialCharacters = "!@#$%&*()_-=+-,.;/\\'\"`"

function choiceAtRandom(interable) {
    const randomIndex = Math.floor(Math.random() * interable.length)
    const randomChoice = interable[randomIndex]
    return randomChoice
}

function generateRandomCode(
    length,
    allowUpperLetters = false,
    allowDigits = false,
    allowSpecialCharacters = false
) {
    let charactersAllowed = `${lowerLetters}`
    let randomCode = ""

    if (allowUpperLetters) charactersAllowed += upperLetters
    if (allowDigits) charactersAllowed += digits
    if (allowSpecialCharacters) charactersAllowed += specialCharacters

    for (let i = 0; i <= length; i++) {
        randomCode += choiceAtRandom(charactersAllowed)
    }

    return randomCode
}

export {
    choiceAtRandom,
    generateRandomCode
}