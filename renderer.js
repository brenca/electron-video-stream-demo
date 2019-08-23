// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const video = document.querySelector('video')
const source = new MediaSource()
video.src = URL.createObjectURL(source)


source.addEventListener('sourceopen', () => {
    const sourceBuffer = source.addSourceBuffer('video/webm; codecs="vorbis,vp8"')
    sourceBuffer.mode = 'sequence'

    const request = new Request('atom://video')
    fetch(request).then(response => {
        const reader = response.body.getReader()
        const doRead = () => {
            return reader.read().then(({ done, value }) => {
                return new Promise((resolve, reject) => {
                    if (done) {
                        source.endOfStream()
                        resolve(false)
                    } else {
                        sourceBuffer.addEventListener('update', () => {
                            if (video.paused) video.play()
                            resolve(true)
                        })
                        sourceBuffer.appendBuffer(value)
                        sourceBuffer.onerror = reject
                        sourceBuffer.onabort = reject
                    }
                })
            })
            .then(shouldContinue => {
                if (shouldContinue)
                    doRead()
            })
            .catch(error => {
                console.log(error)
                console.log(error.message)
            })
        }
        doRead()
    })
})