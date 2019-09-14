import { js2xml, xml2js } from 'xml-js'
import { XMLElement } from './types'
import { get, post } from './https'

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

    const options: object = {
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

    const response: string = await get(options)
    const body: string = js2xml(xml2js(response, { textFn }))
    await post(options, body)
}
