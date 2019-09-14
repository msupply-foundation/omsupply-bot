import { Context } from 'probot';
import { GitHubAPI } from 'probot/lib/github';

import { filterNull, flatMapPromise } from './functions';
import {
  getRepo,
  getProject,
  getColumns,
  getCards,
  findCard,
  moveCard,
  parseIssueNumber,
  getIssue,
  updatePullRequest,
  createComment,
} from './helpers';
import {
  Repo,
  Project,
  ColumnMap,
  Card,
  Column,
  PullRequestPayload,
  PullRequestPayloadPullRequest,
  GetIssueParams,
  Issue,
  CreateCommentParams,
} from './types';
import { ERRORS } from './constants';

export const opened = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: PullRequestPayload } = context;
  const { pull_request }: { pull_request: PullRequestPayloadPullRequest } = payload;
  const { body }: { body: string } = pull_request;
  const issueParams: GetIssueParams = context.issue();
  const repo: Repo = await getRepo(github, issueParams);
  const issueNumber: number = parseInt(parseIssueNumber(body));

  if (issueNumber && repo) {
    const linkedIssueParams: GetIssueParams = { ...issueParams, number: issueNumber };
    const linkedIssue: Issue = await getIssue(github, linkedIssueParams);
    await updatePullRequest(github, linkedIssue, issueParams);
    const repoProject: Project | undefined = await getProject(github, repo);

    if (repoProject) {
      const columns: ColumnMap = await getColumns(github, repoProject);
      const columnList: Column[] = filterNull([columns.TO_TRIAGE, columns.TO_DO, columns.DOING]);
      const { IN_PR: columnInPR } = columns;
      const cards: Card[] = await flatMapPromise(columnList, column => getCards(github, column));
      const card: Card | undefined = findCard(cards, linkedIssue);
      if (card && columnInPR) await moveCard(github, card, columnInPR);
    }
  } else {
    const commentParams: CreateCommentParams = { ...issueParams, body: ERRORS.NO_LINKED_ISSUE };
    await createComment(github, commentParams);
  }
};

export default { opened };
