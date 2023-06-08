function createLogger(name) {
    function log(message) {
        console.log(`> [${name}-robot] ${message}`)
    }

    function info(message) {
        console.info(`> [${name}-robot-info] ${message}`)
    }

    function warning(message) {
        console.info(`> [${name}-robot-warning] ${message}`)
    }

    function error(message) {
        console.info(`> [${name}-robot-error] ${message}`)
    }

    return {
        log,
        info,
        warning,
        error
    }
}

export default createLogger