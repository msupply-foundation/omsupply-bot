import { Application, Context } from 'probot'

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
    mapLookup(LABEL_COLUMN_MAP, getLabel(labelName.toLowerCase()))
    'Needs build testing',
    'In build test',
    'Done',
]

const COLUMN_MAP = new Map<string, string>(zip<string>(COLUMN_NAMES, COLUMN_KEYS))

export = (app: Application) => {
    app.on(['pull_request.opened', 'pull_request.reopened'], async (context: Context) => {
        const { github, payload } = context
        const { issues, projects } = github;
        const { owner: pullRequestOwner, repo: pullRequestRepo } = context.issue();
        const { pull_request: pullRequest } = payload
        const { body: pullRequestBody } = pullRequest
        const issueNumber = parseIssueNumber(pullRequestBody)

        console.log(issueNumber);

        const { listForRepo: getRepoProjects } = projects;
        const repoProjects = await getRepoProjects({owner: pullRequestOwner, repo: pullRequestRepo})
        const { data: repoProjectsData } = repoProjects;
        const repoProject = repoProjectsData.find(({ name: repoName }) => repoName.toLowerCase() === pullRequestRepo.toLowerCase())

        if (issueNumber) {
            const parentIssue = await issues.get({ owner: pullRequestOwner, repo: pullRequestRepo, number: issueNumber })
            const { data: parentIssueData } = parentIssue;
            const { labels: parentIssueLabels, milestone: parentIssueMilestone } = parentIssueData;
            const parentIssueLabelNames = parentIssueLabels.map(label => label.name)

            console.log(parentIssueLabels)
            console.log(parentIssueMilestone)

            const { number: parentIssueMilestoneNumber } = parentIssueMilestone;
            const updatedPullRequest = await context.issue({ labels: parentIssueLabelNames, milestone: parentIssueMilestoneNumber });
            await issues.update(updatedPullRequest)

            if (repoProject) {
                const { url: parentIssueUrl } = parentIssueData;
                const { id: projectId } = repoProject;
                const columnsList = await projects.listColumns({ project_id: projectId });
                const { data: columnsData } = columnsList;
                const columns: { [index: string]: any } = columnsData
                 .map(column => {
                    const { name: columnName } = column
                    const columnKey = COLUMN_MAP.get(columnName) || columnName
                    return { [columnKey]: column }
                }).reduce((acc, column) => ({ ...acc, ...column }))
                const { IN_TRIAGE: columnInTriage, TO_DO: columnToDo, DOING: columnDoing, IN_PR: columnInPR } = columns
                const issueColumns = [columnInTriage, columnToDo, columnDoing]
                const issueCards = await Promise.all(issueColumns.map(({id: columnId}) => projects.listCards({column_id: columnId})));
                const issueCardsData = issueCards.flatMap(({ data: cardData }) => cardData)
                const issueCard = issueCardsData.find(({ content_url: cardUrl }) => cardUrl === parentIssueUrl)

                if (issueCard) {
                    const { id: card_id } = issueCard
                    const { id: column_id } = columnInPR
                    await projects.moveCard({
                        card_id,
                        position: 'top',
                        column_id,
                    });
                }
            } 
        } else {
            const body = 'Beep boop. This PR does not have an associated issue!'
            await issues.createComment(context.issue({body}));
        }
    })
}