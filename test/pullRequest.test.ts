import { Probot } from 'probot';
import nock from 'nock';

import App from '../src';
import { ERRORS } from '../src/constants';

import { 
  pullRequestOpenedWithoutIssue,
  pullRequestOpenedWithIssue
} from './fixtures/pullRequest';
import { parseIssueNumber } from '../src/helpers';

nock.disableNetConnect();

describe('pull request opened', () => {
  let probot: Probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(App);
    app.app = () => 'test';
  });

  test('create a comment if a pull request has no linked issue', async done => {
    const { payload: pullRequestOpenedNoIssuePayload } = pullRequestOpenedWithoutIssue;
    const {
      pull_request: pullRequest,
      repository: pullRequestRepository,
    } = pullRequestOpenedNoIssuePayload;
    const { number: pullRequestNumber } = pullRequest;
    const { name: repositoryName, owner: repositoryOwner } = pullRequestRepository;
    const { login: repositoryOwnerName } = repositoryOwner;

    // Test bot makes GET request for PR repo.
    nock('https://api.github.com')
      .get(`/repos/${repositoryOwnerName}/${repositoryName}?number=${pullRequestNumber}`)
      .reply(200, pullRequestRepository)
      .log(console.log);

    // Test bot makes POST request to update PR comment.
    nock('https://api.github.com')
      .post(
        `/repos/${repositoryOwnerName}/${repositoryName}/issues/${pullRequestNumber}/comments`,
        (payload: object) => {
          expect(payload).toMatchObject({ body: ERRORS.NO_LINKED_ISSUE });
          return true;
        }
      )
      .reply(200)
      .log(console.log);

    // Pass test if all mocked APIs are called and bot posts correct error comment to PR.
    done(nock.isDone())

    // Send bot a webhook event for a new PR without a linked issue.
    await probot.receive({ name: 'pull_request', payload: pullRequestOpenedNoIssuePayload });
  });

  test('copy labels if pull request has a linked issue', async done => {
    const { payload: pullRequestOpenedWithIssuePayload, issue: pullRequestLinkedIssue } = pullRequestOpenedWithIssue;
    const {
      pull_request: pullRequest,
      repository: pullRequestRepository,
    } = pullRequestOpenedWithIssuePayload;
    const { number: pullRequestNumber, body: pullRequestBody } = pullRequest;
    const { name: repositoryName, owner: repositoryOwner } = pullRequestRepository;
    const { login: repositoryOwnerName } = repositoryOwner;

    // Test bot makes GET request for PR repo.
    nock('https://api.github.com')
      .get(`/repos/${repositoryOwnerName}/${repositoryName}?number=${pullRequestNumber}`)
      .reply(200, pullRequestRepository)
      .log(console.log);

    // Test bot correctly parses linked issue number.
    const { number: issueNumber } = pullRequestLinkedIssue;
    expect(parseInt(parseIssueNumber(pullRequestBody))).toEqual(issueNumber);

    // Test bot makes GET request for linked issue.
    nock('https://api.github.com')
    .get(`/repos/${repositoryOwnerName}/${repositoryName}/issues/${issueNumber}`)
    .reply(200)
    .log(console.log);

    // Test bot makes empty PATCH request to update PR.
    nock('https://api.github.com')
    .patch(`/repos/${repositoryOwnerName}/${repositoryName}/issues/${pullRequestNumber}`)
    .reply(200)
    .log(console.log);

    // Text bot makes GET request for project boards.
    nock('https://api.github.com')
    .get(`/repos/${repositoryOwnerName}/${repositoryName}/projects`)
    .reply(200, [])
    .log(console.log);

    // Pass test if all mocked APIs are called.
    done(nock.isDone());

    // Send bot a webhook event for a new PR without a linked issue.
    await probot.receive({ name: 'pull_request', payload: pullRequestOpenedWithIssuePayload });
  });
});
