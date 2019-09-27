import { Probot } from 'probot';
import nock from 'nock';

import App from '../src';

import { projectCardMoved } from './fixtures/projectCard';

nock.disableNetConnect();

describe('project card moved', () => {
  let probot: Probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(App);
    app.app = () => 'test';
  });

  test('create a label if a card is moved to a new column', async () => {
    const { payload: projectCardMovedPayload, issue: projectCardIssue } = projectCardMoved;
    const { project_card: projectCard, repository: projectCardRepository } = projectCardMovedPayload;
    const { name: repositoryName, owner: repositoryOwner } = projectCardRepository;
    const { login: repositoryOwnerName } = repositoryOwner
    const { column_id: columnId, content_url: contentUrl } = projectCard;
    const { number: issueNumber } = projectCardIssue;

    // Test bot makes GET request for card column.
    const getProjectColumn = nock('https://api.github.com')
      .get(`/projects/columns/${columnId}`)
      .reply(200)
      .log(console.log);

    // Test bot makes GET request for card issue.
    const getCardIssue = nock(contentUrl)
    .get('')
    .reply(200, projectCardIssue)
    .log(console.log);

    // Test bot makes PATCH request to update issue labels.
    const updatePullRequestLabels = nock('https://api.github.com')
    .patch(`/repos/${repositoryOwnerName}/${repositoryName}/issues/${issueNumber}`)
    .reply(200)
    .log(console.log);

    // Send bot a webhook event for a moved card.
    await probot.receive({ name: 'project_card', payload: projectCardMovedPayload });

    getProjectColumn.done();
    getCardIssue.done();
    updatePullRequestLabels.done();
  });
});
