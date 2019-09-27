import { Probot } from 'probot';
import nock, { isDone } from 'nock';

import App from '../src';
import { ERRORS } from '../src/constants';

import { pullRequestOpenedWithoutIssue, pullRequestOpenedWithIssue } from './fixtures/pullRequest';
import { parsePullRequestIssueNumber } from '../src/helpers';

nock.disableNetConnect();

describe('pull request opened', () => {
  let probot: Probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(App);
    app.app = () => 'test';
  });

  test('create a comment if a pull request has no linked issue', async () => {
    const { payload: pullRequestOpenedNoIssuePayload } = pullRequestOpenedWithoutIssue;
    const {
      pull_request: pullRequest,
      repository: pullRequestRepository,
    } = pullRequestOpenedNoIssuePayload;
    const { number: pullRequestNumber } = pullRequest;
    const { name: repositoryName, owner: repositoryOwner } = pullRequestRepository;
    const { login: repositoryOwnerName } = repositoryOwner;

    // Test bot makes GET request for PR repo.
    const getPullRequestRepo = nock('https://api.github.com')
      .get(`/repos/${repositoryOwnerName}/${repositoryName}?number=${pullRequestNumber}`)
      .reply(200, pullRequestRepository)
      .log(console.log);

    // Test bot makes POST request to update PR comment.
    const updatePullRequestComment = nock('https://api.github.com')
      .post(
        `/repos/${repositoryOwnerName}/${repositoryName}/issues/${pullRequestNumber}/comments`,
        (payload: object) => {
          expect(payload).toMatchObject({ body: ERRORS.NO_LINKED_ISSUE });
          return true;
        }
      )
      .reply(200)
      .log(console.log);

    // Send bot a webhook event for a new PR without a linked issue.
    await probot.receive({ name: 'pull_request', payload: pullRequestOpenedNoIssuePayload });

    getPullRequestRepo.done();
    updatePullRequestComment.done();
  });

  test('copy labels if pull request has a linked issue', async () => {
    const {
      payload: pullRequestOpenedWithIssuePayload,
      issue: pullRequestLinkedIssue,
    } = pullRequestOpenedWithIssue;
    const {
      pull_request: pullRequest,
      repository: pullRequestRepository,
    } = pullRequestOpenedWithIssuePayload;
    const { number: pullRequestNumber, body: pullRequestBody } = pullRequest;
    const { name: repositoryName, owner: repositoryOwner } = pullRequestRepository;
    const { login: repositoryOwnerName } = repositoryOwner;

    // Test bot makes GET request for PR repo.
    const getPullRequestRepo = nock('https://api.github.com')
      .get(`/repos/${repositoryOwnerName}/${repositoryName}?number=${pullRequestNumber}`)
      .reply(200, pullRequestRepository)
      .log(console.log);

    // Test bot correctly parses linked issue number.
    const { number: issueNumber } = pullRequestLinkedIssue;
    expect(parseInt(parsePullRequestIssueNumber(pullRequestBody))).toEqual(issueNumber);

    // Test bot makes GET request for linked issue.
    const getLinkedIssue = nock('https://api.github.com')
      .get(`/repos/${repositoryOwnerName}/${repositoryName}/issues/${issueNumber}`)
      .reply(200)
      .log(console.log);

    // Test bot makes empty PATCH request to update PR labels.
    const updatePullRequestLabels = nock('https://api.github.com')
      .patch(`/repos/${repositoryOwnerName}/${repositoryName}/issues/${pullRequestNumber}`, {})
      .reply(200)
      .log(console.log);

    // Test bot makes empty PATCH request to update PR milestone.
    const updatePullRequestMilestone = nock('https://api.github.com')
      .patch(`/repos/${repositoryOwnerName}/${repositoryName}/issues/${pullRequestNumber}`, {})
      .reply(200)
      .log(console.log);

    // Text bot makes GET request for project boards.
    const getProjectBoards = nock('https://api.github.com')
      .get(`/repos/${repositoryOwnerName}/${repositoryName}/projects`)
      .reply(200, [])
      .log(console.log);

    // Send bot a webhook event for a new PR without a linked issue.
    await probot.receive({ name: 'pull_request', payload: pullRequestOpenedWithIssuePayload });

    getPullRequestRepo.done();
    getLinkedIssue.done();
    updatePullRequestLabels.done();
    updatePullRequestMilestone.done();
    getProjectBoards.done();
  });
});
