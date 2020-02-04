import { Probot } from 'probot';
import nock from 'nock';

import App from '../src';

import { releaseCreated, repoMilestones, linkedMilestone, linkedIssues } from './fixtures/release';

nock.disableNetConnect();

describe('release created', () => {
  let probot: Probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(App);
    app.app = () => 'test';
  });

  test('List issues with milestone linked to the new release', async () => {
    const { payload: releasePayload } = releaseCreated;
    const { repository: repositoryRelease } = releasePayload;
    const { name: repositoryName, owner: repositoryOwner } = repositoryRelease;
    const { login: repositoryOwnerName } = repositoryOwner;
    const { number: milestoneNumber } = linkedMilestone;
  
    // Test bot makes GET request for All milestones from repo.
    const getMilestones = nock('https://api.github.com')
    .get(`/repos/${repositoryOwnerName}/${repositoryName}/milestones`)
    .reply(200, repoMilestones)
    .log(console.log);

    // Test bot makes GET request for Issues linked to a milestone number.
    const getMilestoneIssues = nock('https://api.github.com')
    .get(`/repos/${repositoryOwnerName}/${repositoryName}/issues?milestone=${milestoneNumber}`)
    .reply(200, linkedIssues)
    .log(console.log);

    await probot.receive({ name: 'release', payload: releasePayload });

    getMilestones.done();
    getMilestoneIssues.done();

  });
});
