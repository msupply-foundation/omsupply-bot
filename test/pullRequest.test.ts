import { Probot } from 'probot';
import nock from 'nock';

import App from '../src';
import { ERRORS } from '../src/constants';

import { opened as pullRequestOpenedPayload } from './fixtures/pullRequest.json';

nock.disableNetConnect();

describe('pull request opened', () => {
  let probot: Probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(App);
    app.app = () => 'test';
  });

  test('create a comment if a pull request has no linked issue', async done => {
    const {
      pull_request: pullRequest,
      repository: pullRequestRepository,
    } = pullRequestOpenedPayload;
    const { number: pullRequestNumber } = pullRequest;
    const { name: repositoryName, owner: repositoryOwner } = pullRequestRepository;
    const { login: repositoryOwnerName } = repositoryOwner;

    // Test bot makes GET request for PR repo.
    nock('https://api.github.com')
      .get(`/repos/${repositoryOwnerName}/${repositoryName}?number=${pullRequestNumber}`)
      .reply(200, pullRequestRepository);

    // Test bot makes POST request to update PR comment.
    nock('https://api.github.com')
      .post(
        `/repos/${repositoryOwnerName}/${repositoryName}/issues/${pullRequestNumber}/comments`,
        (payload: object) => {
          done(expect(payload).toMatchObject({ body: ERRORS.NO_LINKED_ISSUE }));
          return true;
        }
      )
      .reply(200);

    // Send bot a webhook event for a new PR without a linked issue.
    await probot.receive({ name: 'pull_request', payload: pullRequestOpenedPayload });
  });
});
