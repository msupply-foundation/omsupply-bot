import { Application, Context } from 'probot'
import { GitHubAPI } from 'probot/lib/github'

import { ERRORS } from './constants'
import { filterNull, flatMapPromise } from './functions'
import {
    getRepo,
    getProject,
    getColumns,
    getCards,
    findCard,
    moveCard,
    getLabelColumn,
    parseIssueNumber,
    updatePullRequest,
    getIssue,
    createComment,
} from './helpers'
import {
    Repo,
    Project,
    ColumnMap,
    Issue,
    GetIssueParams,
    Card,
    Column,
    IssuePayload,
    PullRequestPayload,
    IssueLabelPayload,
    IssuePayloadIssue,
    LabelPayloadLabel,
    PullRequestPayloadPullRequest,
    GetRepoParams,
    CreateCommentParams,
} from './types'

export = (app: Application) => {
    app.on('issues.assigned', async (context: Context) => {
        const { github, payload }: { github: GitHubAPI; payload: IssuePayload } = context
        const { issue }: { issue: { url: string } } = payload
        const repoParams: GetRepoParams = context.issue()
        const repo: Repo = await getRepo(github, repoParams)
        const repoProject: Project | undefined = await getProject(github, repo)

        if (repoProject) {
            const columns: ColumnMap = await getColumns(github, repoProject)
            const { TO_TRIAGE: columnToTriage, TO_DO: columnToDo } = columns

            if (columnToTriage && columnToDo) {
                const cards: Card[] = await getCards(github, columnToTriage)
                const card: Card | undefined = findCard(cards, issue)
                if (card) await moveCard(github, card, columnToDo)
            }
        }
    })

    app.on('issues.labeled', async (context: Context) => {
        const { github, payload }: { github: GitHubAPI; payload: IssueLabelPayload } = context
        const repoParams: GetRepoParams = context.issue()
        const { label, issue }: { label: LabelPayloadLabel; issue: IssuePayloadIssue } = payload
        const { name }: { name: string } = label
        const repo: Repo = await getRepo(github, repoParams)
        const repoProject: Project | undefined = await getProject(github, repo)
        const labelColumn: string | undefined = getLabelColumn(name)

        if (repoProject && labelColumn) {
            const columns: ColumnMap = await getColumns(github, repoProject)
            const columnList: Column[] = filterNull([
                columns.TO_TRIAGE,
                columns.TO_DO,
                columns.DOING,
                columns.IN_PR,
                columns.TO_TEST,
                columns.TESTING,
                columns.DONE,
            ])

            const cards: Card[] = await flatMapPromise(columnList, column => getCards(github, column))
            const card: Card | undefined = findCard(cards, issue)
            const column: Column = columns[labelColumn]
            if (card && column) await moveCard(github, card, column)
        }
    })

    app.on(['pull_request.opened', 'pull_request.reopened'], async (context: Context) => {
        const { github, payload }: { github: GitHubAPI; payload: PullRequestPayload } = context
        const { pull_request }: { pull_request: PullRequestPayloadPullRequest } = payload
        const { body }: { body: string } = pull_request
        const issueParams: GetIssueParams = context.issue()
        const repo: Repo = await getRepo(github, issueParams)
        const issueNumber: number = parseInt(parseIssueNumber(body))

        if (issueNumber && repo) {
            const linkedIssueParams: GetIssueParams = { ...issueParams, number: issueNumber }
            const linkedIssue: Issue = await getIssue(github, linkedIssueParams)
            await updatePullRequest(github, linkedIssue, issueParams)
            const repoProject: Project | undefined = await getProject(github, repo)

            if (repoProject) {
                const columns: ColumnMap = await getColumns(github, repoProject)
                const columnList: Column[] = filterNull([columns.TO_TRIAGE, columns.TO_DO, columns.DOING])
                const { IN_PR: columnInPR } = columns
                const cards: Card[] = await flatMapPromise(columnList, column => getCards(github, column))
                const card: Card | undefined = findCard(cards, linkedIssue)
                if (card && columnInPR) await moveCard(github, card, columnInPR)
            }
        } else {
            const commentParams: CreateCommentParams = { ...issueParams, body: ERRORS.NO_LINKED_ISSUE }
            await createComment(github, commentParams)
        }
    })
}
