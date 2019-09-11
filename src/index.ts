import { Application } from 'probot'

import issue from './issue';
import pullRequest from './pullRequest'
import {

const events = {
    'issueAssigned': 'issues.assigned',
    'issueLabelled': 'issues.labeled',
    'pullRequestOpened': ['pull_request.opened', 'pull_request.reopened'],
        const repoParams: GetRepoParams = context.issue()
}

export = (app: Application) => {
    app.on(events.issueAssigned, issue.assigned)
    app.on(events.issueLabelled, issue.labelled)
    app.on(events.pullRequestOpened, pullRequest.opened)
        const { name }: { name: string } = label
}
