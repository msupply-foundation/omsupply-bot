import { Application, Context } from 'probot'

function zip<T>(a: T[], b: T[]): Readonly<Readonly<[T, T]>[]> {
    return a.map((v, i) => [v, b[i]])
}

const COLUMN_KEYS: string[] = ['IN_TRIAGE', 'TO_DO', 'DOING', 'IN_PR', 'TO_TEST', 'TESTING', 'DONE']
const COLUMN_NAMES: string[] = [
    'Issue triage',
    'To do',
    'In progress',
    'In PR',
    'Needs build testing',
    'In build test',
    'Done',
]

const COLUMN_MAP = new Map<string, string>(zip<string>(COLUMN_KEYS, COLUMN_NAMES))

const getIssueNumber = (context: Context) => {
    const { payload } = context
    const { pull_request } = payload
    const { body } = pull_request

    const issueRegex = /\#(\d+)/
    const issueRegexMatch = issueRegex.exec(body)

    if (!issueRegexMatch) return null

    const issueRegexResult = issueRegexMatch[1]
    const issueNumber = parseInt(issueRegexResult)

    return issueNumber || null
}

const getIssue = async (context: Context, { owner, repo, number }: { owner: string; repo: string; number: number }) => {
    const issue = await context.github.issues.get({ owner, repo, number })
    return issue
}

const getProject = async (context: Context, { owner, repo }: { owner: string; repo: string }) => {
    const projects = await context.github.projects.listForRepo({
        owner,
        repo,
    })

    return projects && projects.data[0]
}

const getColumns = async (context: Context, { id: project_id }: { id: number }) => {
    return context.github.projects.listColumns({
        project_id,
    })
}

const getCards = async (context: Context, { id: column_id }: { id: number }) => {
    return context.github.projects.listCards({
        column_id,
    })
}

const moveCard = async (context: Context, { card_id, column_id }: { card_id: number; column_id: number }) => {
    return context.github.projects.moveCard({
        card_id,
        position: 'top',
        column_id,
    })
}

const postComment = async (context: Context, body: string) => {
    const comment = context.issue({ body })
    return context.github.issues.createComment(comment)
}

const updateLabels = async (
    context: Context,
    { owner, repo, number }: { owner: string; repo: string; number: number }
) => {
    const issue = await getIssue(context, { owner, repo, number })
    const labels = issue.data.labels.map(label => label.name)
    return context.github.issues.update(context.issue({ labels }))
}

const updateMilestone = async (
    context: Context,
    { owner, repo, number }: { owner: string; repo: string; number: number }
) => {
    const issue = await getIssue(context, { owner, repo, number })
    const milestone = issue.data.milestone.number
    return context.github.issues.update(context.issue({ milestone }))
}

const updateProject = async (
    context: Context,
    { owner, repo, number }: { owner: string; repo: string; number: number }
) => {
    const issue = await getIssue(context, { owner, repo, number })
    const project = await getProject(context, { owner, repo })

    if (project) {
        const { data: issueData } = issue
        const { url: issueUrl } = issueData
        const { data: columnsData } = await getColumns(context, project)

        const columns: { [index: string]: any } = columnsData
            .map(column => {
                const { name: columnName } = column
                const columnKey = COLUMN_MAP.get(columnName) || columnName
                return { [columnKey]: column }
            })
            .reduce((acc, column) => ({ ...acc, ...column }))

        const {
            IN_TRIAGE: columnInTriage,
            TO_DO: columnToDo,
            DOING: columnDoing,
            IN_PR: columnInPR,
            TO_TEST: columnToTest,
            TESTING: columnTesting,
            DONE: columnDone,
        } = columns

        const issueColumns = [columnInTriage, columnToDo, columnDoing]
        const issueCards = await Promise.all(issueColumns.map(column => getCards(context, column)))
        const issueCardsData = issueCards.flatMap(({ data: cardData }) => cardData)
        const issueCard = issueCardsData.find(({ content_url: cardUrl }) => cardUrl === issueUrl)

        if (issueCard) {
            const { id: card_id } = issueCard
            const { id: column_id } = columnInPR
            await moveCard(context, { card_id, column_id })
        }
    }
}

export = (app: Application) => {
    app.on(['pull_request.opened', 'pull_request.reopened'], async (context: Context) => {
        const owner = 'sussol'
        const repo = 'msupply'

        const number = getIssueNumber(context)

        if (number) {
            Promise.all([
                updateLabels(context, { owner, repo, number }),
                updateMilestone(context, { owner, repo, number }),
                updateProject(context, { owner, repo, number }),
            ])

            context.log(`PR opened for issue #${number}.`)
        } else {
            const body = 'Beep boop. This PR does not have an associated issue!'
            await postComment(context, body)

            context.log(`PR opened with no or incorrectly formatted issue number.`)
        }
    })
}
