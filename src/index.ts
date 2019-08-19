import { Application, Context } from 'probot'

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

const getColumnKey = ({ name: columnName }: { name: string }) => {
    const COLUMN_KEYS: { [index: string]: any } = {
        'Issue triage': 'TRIAGE',
        'To do': 'TODO',
        'In progress': 'IN_PROGRESS',
        'In PR': 'IN_PR',
        'Needs build testing': 'NEEDS_TEST',
        'In build test': 'IN_TEST',
        Done: 'DONE',
    }
    return COLUMN_KEYS[columnName]
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
            .map(column => ({ [getColumnKey(column)]: column }))
            .reduce((acc, column) => ({ ...acc, ...column }))

        const {
            TRIAGE: columnTriage,
            TODO: columnToDo,
            IN_PROGRESS: columnInProgress,
            IN_PR: columnInPR,
            NEEDS_TEST: columnNeedsTest,
            IN_TEST: columnInTest,
            DONE: columnDone,
        } = columns

        const issueColumns = [columnTriage, columnToDo, columnInProgress]
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
