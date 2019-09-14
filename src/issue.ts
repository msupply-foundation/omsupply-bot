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
  getLabelColumn,
} from './helpers';
import {
  Repo,
  Project,
  ColumnMap,
  Card,
  Column,
  IssuePayload,
  IssueLabelPayload,
  IssuePayloadIssue,
  LabelPayloadLabel,
  GetRepoParams,
} from './types';

export const assigned = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: IssuePayload } = context;
  const { issue }: { issue: { url: string } } = payload;
  const repoParams: GetRepoParams = context.issue();
  const repo: Repo = await getRepo(github, repoParams);
  const repoProject: Project | undefined = await getProject(github, repo);

  if (repoProject) {
    const columns: ColumnMap = await getColumns(github, repoProject);
    const { TO_TRIAGE: columnToTriage, TO_DO: columnToDo } = columns;

    if (columnToTriage && columnToDo) {
      const cards: Card[] = await getCards(github, columnToTriage);
      const card: Card | undefined = findCard(cards, issue);
      if (card) await moveCard(github, card, columnToDo);
    }
  }
};

export const labelled = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: IssueLabelPayload } = context;
  const repoParams: GetRepoParams = context.issue();
  const { label, issue }: { label: LabelPayloadLabel; issue: IssuePayloadIssue } = payload;
  const { name }: { name: string } = label;
  const repo: Repo = await getRepo(github, repoParams);
  const repoProject: Project | undefined = await getProject(github, repo);
  const labelColumn: string | undefined = getLabelColumn(name);

  if (repoProject && labelColumn) {
    const columns: ColumnMap = await getColumns(github, repoProject);
    const columnList: Column[] = filterNull([
      columns.TO_TRIAGE,
      columns.TO_DO,
      columns.DOING,
      columns.IN_PR,
      columns.TO_TEST,
      columns.TESTING,
      columns.DONE,
    ]);

    const cards: Card[] = await flatMapPromise(columnList, column => getCards(github, column));
    const card: Card | undefined = findCard(cards, issue);
    const column: Column = columns[labelColumn];
    if (card && column) await moveCard(github, card, column);
  }
};

export default { assigned, labelled };
