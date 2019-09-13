import https from 'https'
import { js2xml, xml2js } from 'xml-js'
import { XMLElement } from './types'

export const getConfig = (getOptions: object): Promise<string> =>
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

export const postConfig = (postOptions: object): Promise<string> =>
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
        const { data } = postOptions as { data: string }
        if (data) {
            request.write(data)
        } else {
            request.write('')
        }
        request.end()
    })

const isBranchSpec = (parentXML: XMLElement) => {
    const { parent: parentParentXML } = parentXML
    const { name: parentParentName } = parentParentXML
    return parentParentName === 'hudson.plugins.git.BranchSpec'
}

const isTagSpec = (parentXML: XMLElement) => {
    const { parent: parentParentXML } = parentXML
    const { name: parentName } = parentXML
    const { name: parentParentName } = parentParentXML
    return parentParentName === 'hudson.plugins.git.UserRemoteConfig' && parentName === 'refspec'
}

export const updateBuildSpec = async (tag: string) => {
    const branchSpec: string = `refs/tags/${tag}`
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

    const textFn = (value: string, parentElement: object): string =>
        isBranchSpec(parentElement as XMLElement) ? branchSpec : value

    const response: string = await getConfig(getOptions)
    const config: string = js2xml(xml2js(response, { textFn }))
    await postConfig({ data: config, ...postOptions })
}
