import https from 'https'

export const get = (options: object): Promise<string> =>
    new Promise((resolve, _) => {
        const request = https.get(options, response => {
            let data = ''
            response.on('data', chunk => {
                data = data + chunk
            })
            response.on('end', () => {
                resolve(data)
            })
        })
        request.end()
    })

export const post = (options: object, body: string = ''): Promise<string> =>
    new Promise((resolve, _) => {
        const request = https.request(options, response => {
            let data = ''
            response.on('data', (chunk: string) => {
                data = data + chunk
            })
            response.on('end', () => {
                resolve(data)
            })
        })
        request.write(body)
        request.end()
    })

export default { get, post }
