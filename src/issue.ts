import { Context } from 'probot';
import { GitHubAPI } from 'probot/lib/github';

import { filterNull, flatMapPromise } from './functions';
import { findCard, getLabelColumn, findProject, getColumnsMap } from './helpers';
import {
  Repo,
  Project,
  ColumnMap,
  Card,
  Column,
  IssuePayload,
  IssueLabelPayload,
  GetRepoParams,
  RepoResponse,
  ProjectsResponse,
  Projects,
  ListColumnsParams,
  ColumnsResponse,
  Columns,
  Cards,
  CardsResponse,
  MoveCardParams,
  Label,
  Issue,
} from './types';

export const assigned = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: IssuePayload } = context;
  const { projects, repos } = github;
  const { issue }: { issue: Issue } = payload;
  const repoParams: GetRepoParams = context.issue();
  const repoResponse: RepoResponse = (await repos.get(repoParams)) as RepoResponse;
  const { data: repo }: { data: Repo } = repoResponse;
  const { name: repoName, owner: repoOwner } = repo;
  const { login: ownerName } = repoOwner;
  const listForRepoParams = { repo: repoName, owner: ownerName };
  const repoProjectsResponse: ProjectsResponse = await projects.listForRepo(listForRepoParams);
  const { data: repoProjects }: { data: Projects } = repoProjectsResponse;
  const repoProject: Project | undefined = findProject(repoProjects, repoName);

  if (repoProject) {
    const { id: project_id } = repoProject;
    const listColumnsParams: ListColumnsParams = { project_id };
    const listColumnsResponse: ColumnsResponse = await projects.listColumns(listColumnsParams);
    const { data: projectColumns }: { data: Columns } = listColumnsResponse;
    const columnsMap: ColumnMap = getColumnsMap(projectColumns);
    const { TO_TRIAGE: columnToTriage, TO_DO: columnToDo } = columnsMap;

    if (columnToTriage && columnToDo) {
      const { id: column_id } = columnToTriage;
      const listCardsParams = { column_id };
      const cardsResponse: CardsResponse = (await projects.listCards(
        listCardsParams
      )) as CardsResponse;
      const { data: cards }: { data: Cards } = cardsResponse;
      const card: Card | undefined = findCard(cards, issue);
      if (card) {
        const { id: card_id } = card;
        const moveCardParams: MoveCardParams = { card_id, column_id, position: 'top' };
        await projects.moveCard(moveCardParams);
      }
    }
  }
};

export const labelled = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: IssueLabelPayload } = context;
  const { projects, repos } = github;
  const repoParams: GetRepoParams = context.issue();
  const { label, issue }: { label: Label; issue: Issue } = payload;
  const { name }: { name: string } = label;
  const repoResponse: RepoResponse = (await repos.get(repoParams)) as RepoResponse;
  const { data: repo }: { data: Repo } = repoResponse;
  const { name: repoName, owner: repoOwner } = repo;
  const { login: ownerName } = repoOwner;
  const listForRepoParams = { repo: repoName, owner: ownerName };
  const repoProjectsResponse: ProjectsResponse = await projects.listForRepo(listForRepoParams);
  const { data: repoProjects }: { data: Projects } = repoProjectsResponse;
  const repoProject: Project | undefined = findProject(repoProjects, repoName);
  const labelColumn: string | undefined = getLabelColumn(name);

  if (repoProject && labelColumn) {
    const { id: project_id } = repoProject;
    const listColumnsParams: ListColumnsParams = { project_id };
    const listColumnsResponse: ColumnsResponse = await projects.listColumns(listColumnsParams);
    const { data: projectColumns }: { data: Columns } = listColumnsResponse;
    const columnsMap: ColumnMap = getColumnsMap(projectColumns);
    const columnList: Column[] = filterNull([
      columnsMap.TO_TRIAGE,
      columnsMap.TO_DO,
      columnsMap.DOING,
      columnsMap.IN_PR,
      columnsMap.TO_TEST,
      columnsMap.TESTING,
      columnsMap.DONE,
    ]);

    const cards: Cards = await flatMapPromise(columnList, async column => {
      const { id: column_id } = column;
      const listCardsParams = { column_id };
      const cardsResponse: CardsResponse = (await projects.listCards(
        listCardsParams
      )) as CardsResponse;
      const { data: cards }: { data: Cards } = cardsResponse;
      return cards;
    });

    const card: Card | undefined = findCard(cards, issue);
    const column: Column = columnsMap[labelColumn];
    if (card && column) {
      const { id: column_id } = column;
      const { id: card_id } = card;
      const moveCardParams: MoveCardParams = { card_id, column_id, position: 'top' };
      await projects.moveCard(moveCardParams);
    }
  }
};

export default { assigned, labelled };
