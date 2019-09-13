import { Application } from 'probot'

import issue from './issue';
import pullRequest from './pullRequest'
import release from './release'

const events = {
    'issueAssigned': 'issues.assigned',
    'issueLabelled': 'issues.labeled',
    'pullRequestOpened': ['pull_request.opened', 'pull_request.reopened'],
    releaseCreated: ['release.created', 'release.edited'],
}

export = (app: Application) => {
    app.on(events.issueAssigned, issue.assigned)
    app.on(events.issueLabelled, issue.labelled)
    app.on(events.pullRequestOpened, pullRequest.opened)
    app.on(events.releaseCreated, release.created)
}
