import https from 'https'
import { js2xml, xml2js } from 'xml-js'

const getRequest = (getOptions: object): Promise<string> =>
    new Promise((resolve, _) => {
        const request = https.request(getOptions, response => {
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

const postRequest = (postOptions: object, data: string): Promise<string> =>
    new Promise((resolve, _) => {
        const request = https.request(postOptions, response => {
            let data = ''
            response.on('data', chunk => {
                data = data + chunk
            })
            response.on('end', () => {
                resolve(data)
            })
        })
        request.write(data)
        request.end()
    })

const updateBuildTag = async (tag: string) => {
    const tagSpec: string = `+refs/tags/${tag}:refs/remotes/origin/tags/${tag}`

    const requestOptions: object = {
        hostname: 'jenkins.msupply.org',
        port: 8443,
        path: '/job/mSupplyMaster/config.xml',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Authorization: `Basic ${process.env.JENKINS_AUTH}`,
        },
    }

    const getOptions: object = { method: 'GET', ...requestOptions }
    const postOptions: object = { method: 'POST', ...requestOptions }

    const textFn = (value: string, parentElement: object): string => {
        const { parent: parentParentElement } = parentElement as { parent: object }
        const { name: parentName } = parentElement as { name: string }
        const { name: parentParentName } = parentParentElement as { name: string }
        if (parentParentName === 'hudson.plugins.git.BranchSpec') return tagSpec
        if (parentParentName === 'hudson.plugins.git.UserRemoteConfig' && parentName === 'refspec') return tagSpec
        return value
    }

    const response: string = await getRequest(getOptions)
    const config: string = js2xml(xml2js(response, { textFn }))
    await postRequest(postOptions, config)
}