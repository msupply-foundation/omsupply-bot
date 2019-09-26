import { Application } from 'probot';

import pullRequest from './pullRequest';

const events = {
  pullRequestOpened: ['pull_request.opened', 'pull_request.reopened'],
};

export = (app: Application) => {
  app.on(events.pullRequestOpened, pullRequest.opened);
  // app.on(events.releaseCreated, release.created);
};
