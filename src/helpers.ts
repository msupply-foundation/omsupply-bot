import { GitHubAPI } from 'probot/lib/github';

import { COLUMNS, LABELS, LABEL_COLUMNS, REGEX, COLUMN_LABEL_NAME } from './constants';

import { zip, map, stringEquals, find, merge, mapFilterNull } from './functions';
import {
  Repo,
  Issue,
  GetIssueParams,
  Project,
  ColumnMap,
  Column,
  Card,
  MoveCardParams,
  CreateCommentParams,
  UpdateIssueParams,
} from './types';

export const toCapitalCase = ([head, ...tail]: string)  => head.toUpperCase() + tail.join('').toLowerCase();

export const parsePullRequestIssueNumber = (issueBody: string): string => {
  const matches = issueBody.match(REGEX.ISSUE_NUMBER);
  const [, issueNumber] = matches || [, ''];
  return (issueNumber && issueNumber.toLowerCase()) || '';
};

export const parseUrlIssueNumber = (issueUrl: string): string => {
  const matches = issueUrl.match(REGEX.URL_ISSUE_NUMBER)
  const [, issueNumber] = matches || [, ''];
  return issueNumber || '';
};

export const parseIssueLabel = (labelName: string): string => {
  const matches = labelName.match(REGEX.ISSUE_LABEL);
  const [, issueLabel] = matches || [, ''];
  return (issueLabel && issueLabel.toLowerCase()) || '';
};

export const COLUMN_MAP = new Map<string, string>(zip<string>(COLUMNS.NAMES, COLUMNS.KEYS));
export const LABEL_MAP = new Map<string, string>(zip<string>(LABELS.NAMES, LABELS.KEYS));
export const LABEL_COLUMN_MAP = new Map<string, string>(LABEL_COLUMNS);

export const mapLookup = <T, U>(m: Map<T, U>, k: T): U | undefined => m.get(k);
export const getColumn = (columnName: string): string | undefined =>
  mapLookup(COLUMN_MAP, columnName.toLowerCase());
export const getLabel = (labelName: string): string | undefined =>
  mapLookup(LABEL_MAP, labelName.toLowerCase());
export const getLabelColumn = (labelName: string): string | undefined =>
  mapLookup(LABEL_COLUMN_MAP, getLabel(parseIssueLabel(labelName).toLowerCase()));

export const createComment = async (github: GitHubAPI, commentParams: CreateCommentParams) => {
  const { issues } = github;
  const { createComment } = issues;
  return createComment(commentParams);
};

export const createColumnLabel = (columnName: string): string => `${toCapitalCase(COLUMN_LABEL_NAME)}: ${columnName}`;

export const getCards = async (github: GitHubAPI, column: Column): Promise<Card[]> => {
  const { projects } = github;
  const { listCards } = projects;
  const { id: column_id } = column;
  const listCardsParams = { column_id };
  return listCards(listCardsParams).then(({ data }) => data as Card[]);
};

export const getColumns = async (github: GitHubAPI, project: Project): Promise<ColumnMap> => {
  const { projects } = github;
  const { listColumns } = projects;
  const { id: project_id } = project;
  const listColumnsParams = { project_id };
  const columns = listColumns(listColumnsParams).then(({ data }) =>
    merge(
      mapFilterNull(data, column => {
        const { name } = column;
        const columnKey = getColumn(name);
        return columnKey && { [columnKey]: column };
      })
    )
  );
  return columns as Promise<ColumnMap>;
};

export const getIssue = async (github: GitHubAPI, issueParams: GetIssueParams) => {
  const { issues } = github;
  const { get } = issues;
  return get(issueParams).then(({ data }) => data);
};

export const getProject = async (github: GitHubAPI, repo: Repo) => {
  const { projects } = github;
  const { listForRepo } = projects;
  const { name: repoName, owner: repoOwner } = repo;
  const { login: ownerName } = repoOwner;
  const listForRepoParams = { repo: repoName, owner: ownerName };
  const isRepoProject = ({ name: projectName }: { name: string }) =>
    stringEquals(projectName, repoName);
  const findRepoProject = ({ data }: { data: Project[] }) => find(data, isRepoProject);
  return listForRepo(listForRepoParams).then(findRepoProject);
};

export const updateIssue = async (github: GitHubAPI, issueParams: UpdateIssueParams) => {
  const { issues } = github;
  const { update } = issues;
  return update(issueParams);
};

export const mapLabelParam = ({ name }: { name: string }) => name;
export const extractMilestoneParam = ({ number }: { number: number }) => number;
export const filterColumnLabel = ({ name }: { name: string }): boolean => !RegExp(REGEX.IS_STATUS_LABEL).test(name);

export const updatePullRequest = async (
  github: GitHubAPI,
  linkedIssue: Issue,
  pullRequestParams: GetIssueParams
) => {
  const { labels: linkedLabels, milestone: linkedMilestone } = linkedIssue;
  const labelParams = linkedLabels && map(linkedLabels, mapLabelParam);
  const milestoneParam = linkedMilestone && extractMilestoneParam(linkedMilestone);
  const updateParams = { ...pullRequestParams, labels: labelParams, milestone: milestoneParam };
  return updateIssue(github, updateParams);
};

export const moveCard = (github: GitHubAPI, card: Card, column: Column) => {
  const { projects } = github;
  const { moveCard } = projects;
  const { id: card_id } = card;
  const { id: column_id } = column;
  const moveCardParams: MoveCardParams = { card_id, column_id, position: 'top' };
  return moveCard(moveCardParams);
};

export const findCard = (cards: Card[], issue: { url: string }) => {
  const { url } = issue;
  return find(cards, ({ content_url }) => stringEquals(content_url, url));
};
