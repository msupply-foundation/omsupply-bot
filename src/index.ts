import { Application, Context } from 'probot'
import {
    ProjectsListForRepoResponseItem,
    ProjectsListCardsResponseItem,
    ProjectsListColumnsResponseItem,
    ProjectsMoveCardParams,
    ReposGetResponse,
    IssuesGetResponse,
    IssuesGetParams,
} from '@octokit/rest'
import { GitHubAPI } from 'probot/lib/github'

const COLUMN_KEYS: readonly string[] = ['TO_TRIAGE', 'TO_DO', 'TO_PR', 'IN_PR', 'TO_TEST', 'IN_TEST', 'DONE']

const COLUMN_NAMES: readonly string[] = [
    'issue triage',
    'to do',
    'in progress',
    'in pr',
    'needs build testing',
    'in build test',
    'done',
]

const LABEL_KEYS: readonly string[] = [
    'BUG',
    'FEATURE',
    'DOCS',
    'EFFORT',
    'PRIORITY',
    'CUSTOMER',
    'MODULE',
    'STRUCTURE',
    'TYPE',
    'IN_TEST',
    'TESTED',
    'CLOSED',
]

const LABEL_NAMES: readonly string[] = [
    'bug',
    'feature',
    'docs',
    'effort',
    'priority',
    'customer',
    'module',
    'structure',
    'type',
    'build testing',
    'build tested',
    'closed',
]

const LABEL_COLUMNS: readonly (readonly [string, string])[] = [['TESTED', 'DONE'], ['CLOSED', 'DONE']]

const regexIssueNumber: RegExp = /\#(\d+)/
const regexIssueLabel: RegExp = /(.*):/

const distinct = <T>(a: readonly T[]): T[] => Array.from(new Set(a))

const filter = <T>(a: readonly T[], f: (_: T) => boolean): T[] => a.filter(f)

const filterNull = <T>(a: readonly T[]): NonNullable<T>[] => mapNull(filter(a, isNull))

const find = <T>(a: readonly T[], f: (_: T) => boolean): T | undefined => a.find(f) || undefined

const isNull = <T>(v: T): boolean => v != null && v != undefined

const flat = <T>(a: readonly T[][]): T[] => a.flat()

const flatMap = <T, U>(a: readonly T[], f: (v: T, i: number) => U[]): U[] => a.flatMap(f)

const map = <T, U>(a: readonly T[], f: (v: T, i: number) => U): U[] => a.map(f)

const merge = (a: Object[]): Object => reduce(a, (acc: Object, curr: Object) => ({ ...acc, ...curr }))

const mapDistinct = <T, U>(a: readonly T[], f: (_: T) => U): U[] => distinct(map(a, f))

const mapFilter = <T, U>(a: readonly T[], f: (_: T) => U, g: (_: U) => boolean): U[] => filter(map(a, f), g)

const mapFilterNull = <T, U>(a: readonly T[], f: (_: T) => U): NonNullable<U>[] => filterNull(map(a, f))

const mapMerge = <T>(a: readonly T[], f: (_: T) => Object): Object => merge(map(a, f))

const mapNull = <T>(a: readonly T[]): NonNullable<T>[] => map(a, v => v!)

const mapReduce = <T, U>(a: readonly T[], f: (_: T) => U, g: (acc: U, curr: U) => U): U => reduce(map(a, f), g)

const flatMapPromise = async <T, U>(a: readonly T[], f: (_: T) => Promise<U[]>): Promise<U[]> =>
    Promise.all(map(a, f)).then(flat)

const mapPromise = async <T, U>(a: readonly T[], f: (_: T) => Promise<U>): Promise<U[]> => Promise.all(map(a, f))

const reduce = <T>(a: readonly T[], f: (acc: T, curr: T) => T): T => a.reduce(f)

const zip = <T>(a: readonly T[], b: readonly T[]): [T, T][] => map(a, (v, i) => [v, b[i]])

const stringEquals = (s: string, w: string) => s.toLowerCase() == w.toLowerCase()

// TODO: parse out comments strings.
const parseIssueNumber = (issueBody: string): string => {
    const matches = issueBody.match(regexIssueNumber)
    const [, issueNumber] = matches || [, '']
    return (issueNumber && issueNumber.toLowerCase()) || ''
}

const parseIssueLabel = (labelName: string): string => {
    const matches = labelName.match(regexIssueLabel)
    const [, issueLabel] = matches || [, '']
    return (issueLabel && issueLabel.toLowerCase()) || ''
}

const COLUMN_MAP = new Map<string, string>(zip<string>(COLUMN_NAMES, COLUMN_KEYS))
const LABEL_MAP = new Map<string, string>(zip<string>(LABEL_NAMES, LABEL_KEYS))
const LABEL_COLUMN_MAP = new Map<string, string>(LABEL_COLUMNS)

const mapLookup = <T, U>(m: Map<T, U>, k: T): U | undefined => m.get(k)
const getColumn = (columnName: string): string | undefined => mapLookup(COLUMN_MAP, columnName.toLowerCase())
const getLabel = (labelName: string): string | undefined => mapLookup(LABEL_MAP, labelName.toLowerCase())
const getLabelColumn = (labelName: string): string | undefined =>
    mapLookup(LABEL_COLUMN_MAP, getLabel(parseIssueLabel(labelName).toLowerCase()))

const getRepo = async (github: GitHubAPI, repoParams: { owner: string, repo: string }) => {
    const { repos } = github
    const { get } = repos
    return get(repoParams).then(({ data }) => data)
}

const getLinkedIssue = async (github: GitHubAPI, repo: ReposGetResponse, issueNumber: number) => {
    const { issues } = github
    const { get } = issues
    const { name: repoName, owner: repoOwner } = repo
    const { login: ownerName } = repoOwner
    const getParams = { repo: repoName, owner: ownerName, number: issueNumber }
    return get(getParams).then(({ data }) => data)
}

const updatePullRequest = async (github: GitHubAPI, linkedIssue: IssuesGetResponse, issueParams: IssuesGetParams) => {
    const extractLabelParam = ({ name }: { name: string }) => name
    const extractMilestoneParam = ({ number }: { number: number }) => number
    const { issues } = github
    const { update } = issues
    const { labels: linkedLabels, milestone: linkedMilestone} = linkedIssue
    const labelParams = linkedLabels && map(linkedLabels, extractLabelParam)
    const milestoneParam = linkedMilestone && extractMilestoneParam(linkedMilestone) 
    const updateParams = { ...issueParams, labels: labelParams, milestone: milestoneParam }
    return update(updateParams)
}

const getProject = async (github: GitHubAPI, repo: ReposGetResponse) => {
    const { projects } = github
    const { listForRepo } = projects
    const { name: repoName, owner: repoOwner } = repo
    const { login: ownerName } = repoOwner
    const listForRepoParams = { repo: repoName, owner: ownerName }
    const isRepoProject = ({ name: projectName }: { name: string }) => stringEquals(projectName, repoName)
    const findRepoProject = ({ data }: { data: ProjectsListForRepoResponseItem[] }) => find(data, isRepoProject)
    return listForRepo(listForRepoParams).then(findRepoProject)
}

const getColumns = async (
    github: GitHubAPI,
    project: ProjectsListForRepoResponseItem
): Promise<{ [index: string]: any }> => {
    const { projects } = github
    const { listColumns } = projects
    const { id: project_id } = project
    const listColumnsParams = { project_id }
    return listColumns(listColumnsParams).then(({ data }) =>
        merge(
            mapFilterNull(data, column => {
                const { name } = column
                const columnKey = getColumn(name)
                return columnKey && { [columnKey]: column }
            })
        )
    )
}

const getCards = async (github: GitHubAPI, column: ProjectsListColumnsResponseItem) => {
    const { projects } = github
    const { listCards } = projects
    const { id: column_id } = column
    const listCardsParams = { column_id }
    return listCards(listCardsParams).then(({ data }) => data)
}

const moveCard = (github: GitHubAPI, card: ProjectsListCardsResponseItem, column: ProjectsListColumnsResponseItem) => {
    const { projects } = github
    const { moveCard } = projects
    const { id: card_id } = card
    const { id: column_id } = column
    const moveCardParams: ProjectsMoveCardParams = { card_id, column_id, position: 'top' }
    return moveCard(moveCardParams)
}

const findCard = (cards: ProjectsListCardsResponseItem[], issue: { url: string }) => {
    const { url } = issue
    return find(cards, ({ content_url }) => stringEquals(content_url, url))
}

export = (app: Application) => {
    app.on('issues.labeled', async (context: Context) => {
        const {
            github,
            payload,
        }: { github: GitHubAPI; payload: { label: { name: string }; issue: { url: string } } } = context
        const repoParams: { repo: string, owner: string } = context.issue()
        const { label, issue }: { label: { name: string }, issue: { url: string } } = payload
        const { name }: { name: string } = label

        const repo: ReposGetResponse = await getRepo(github, repoParams)
        const repoProject: ProjectsListForRepoResponseItem | undefined = await getProject(github, repo)
        const labelColumn: string | undefined = getLabelColumn(name)

        if (repoProject && labelColumn) {
            const columns = await getColumns(github, repoProject)

            const {
                TO_TRIAGE: columnInTriage,
                TO_DO: columnToDo,
                TO_PR: columnDoing,
                IN_PR: columnInPR,
                TO_TEST: columnToTest,
                IN_TEST: columnTesting,
                DONE: columnDone,
            } = columns

            const columnList = filterNull([
                columnInTriage,
                columnToDo,
                columnDoing,
                columnInPR,
                columnToTest,
                columnTesting,
                columnDone,
            ])

            const cards = await flatMapPromise(columnList, column => getCards(github, column))
            const card = findCard(cards, issue)
            const column = columns[labelColumn]

            if (card && column) await moveCard(github, card, column)
        }
    })

    app.on(['pull_request.opened', 'pull_request.reopened'], async (context: Context) => {
        const { github, payload } = context
        const { issues } = github
        const { pull_request: pullRequest } = payload
        const { body: pullRequestBody } = pullRequest
        
        const issueParams: { repo: string, owner: string, number: number } = context.issue() 
        const repo: ReposGetResponse = await getRepo(github, issueParams)
        const issueNumber = parseInt(parseIssueNumber(pullRequestBody))

        if (issueNumber && repo) {
            const linkedIssue = await getLinkedIssue(github, repo, issueNumber) 
            await updatePullRequest(github, linkedIssue, issueParams)
            const repoProject: ProjectsListForRepoResponseItem | undefined = await getProject(github, repo)

            if (repoProject) {
                const columns = await getColumns(github, repoProject)

                const {
                    TO_TRIAGE: columnInTriage,
                    TO_DO: columnToDo,
                    TO_PR: columnDoing,
                    IN_PR: columnInPR,
                } = columns
    
                const columnList = filterNull([
                    columnInTriage,
                    columnToDo,
                    columnDoing,
                ])

                const cards = await flatMapPromise(columnList, column => getCards(github, column))
                const card = findCard(cards, linkedIssue)

                if (card && columnInPR) await moveCard(github, card, columnInPR)
            }
        } else {
            const body = 'Beep boop. This PR does not have an associated issue!'
            await issues.createComment(context.issue({ body }))
        }
    })
}
