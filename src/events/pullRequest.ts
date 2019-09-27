import { Context } from 'probot';
import { GitHubAPI } from 'probot/lib/github';

import { ERRORS } from '../constants';
import { filterNull, flatMapPromise, map } from '../helpers/functions';
import {
  findCard,
  parsePullRequestIssueNumber,
  findProject,
  mapLabelParam,
  getMilestoneParam,
  getColumnsMap,
} from '../helpers/helpers';
import {
  Repo,
  Project,
  ColumnMap,
  Card,
  PullRequestPayload,
  GetIssueParams,
  Issue,
  CreateCommentParams,
  PullRequest,
  UpdateIssueParams,
  MoveCardParams,
  RepoResponse,
  IssueResponse,
  ListColumnsParams,
  ListProjectsParams,
  ProjectsResponse,
  ColumnsResponse,
  Milestone,
  Labels,
  Columns,
  Cards,
  Projects,
  CardsResponse,
} from '../types';

export const opened = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: PullRequestPayload } = context;
  const { issues, projects, repos } = github;
  const { pull_request: pullRequest }: { pull_request: PullRequest } = payload;
  const { body: pullRequestBody }: { body: string } = pullRequest;

  const issueParams: GetIssueParams = context.issue();
  const repoResponse: RepoResponse = (await repos.get(issueParams)) as RepoResponse;
  const { data: repo }: { data: Repo } = repoResponse;
  const { name: repoName, owner: repoOwner } = repo;
  const { login: ownerName } = repoOwner;
  const issueNumber: number = parseInt(parsePullRequestIssueNumber(pullRequestBody));

  if (issueNumber && repo) {
    const linkedIssueParams: GetIssueParams = { ...issueParams, number: issueNumber };
    const linkedIssueResponse: IssueResponse = (await issues.get(
      linkedIssueParams
    )) as IssueResponse;
    const { data: linkedIssue }: { data: Issue } = linkedIssueResponse;

    // Update pull request labels.
    const { labels: linkedLabels }: { labels: Labels } = linkedIssue;
    const labelParams: string[] = linkedLabels && map(linkedLabels, mapLabelParam);
    const updateLabelParams: UpdateIssueParams = { ...issueParams, labels: labelParams };
    await issues.update(updateLabelParams);

    // Update pull request milestone.
    const { milestone: linkedMilestone }: { milestone: Milestone } = linkedIssue;
    const milestoneParam: number = linkedMilestone && getMilestoneParam(linkedMilestone);
    const updateMilestoneParams: UpdateIssueParams = { ...issueParams, milestone: milestoneParam };
    await issues.update(updateMilestoneParams);

    // Update issue card.
    const listForRepoParams: ListProjectsParams = { repo: repoName, owner: ownerName };
    const repoProjectsResponse: ProjectsResponse = await projects.listForRepo(listForRepoParams);
    const { data: repoProjects }: { data: Projects } = repoProjectsResponse;
    const repoProject: Project | undefined = findProject(repoProjects, repoName);

    if (repoProject) {
      const { id: project_id } = repoProject;
      const listColumnsParams: ListColumnsParams = { project_id };
      const listColumnsResponse: ColumnsResponse = await projects.listColumns(listColumnsParams);
      const { data: projectColumns }: { data: Columns } = listColumnsResponse;
      const columnsMap: ColumnMap = getColumnsMap(projectColumns);
      const columnList: Columns = filterNull([
        columnsMap.TO_TRIAGE,
        columnsMap.TO_DO,
        columnsMap.DOING,
      ]);
      const { IN_PR: columnInPR } = columnsMap;
      const cards: Cards = await flatMapPromise(columnList, async column => {
        const { id: column_id } = column;
        const listCardsParams = { column_id };
        const cardsResponse: CardsResponse = (await projects.listCards(
          listCardsParams
        )) as CardsResponse;
        const { data: cards }: { data: Cards } = cardsResponse;
        return cards;
      });

      const card: Card | undefined = findCard(cards, linkedIssue);
      if (card && columnInPR) {
        const { id: card_id } = card;
        const { id: column_id } = columnInPR;
        const moveCardParams: MoveCardParams = { card_id, column_id, position: 'top' };
        await projects.moveCard(moveCardParams);
      }
    }
  } else {
    // Create comment if no linked issue found.
    const commentParams: CreateCommentParams = { ...issueParams, body: ERRORS.NO_LINKED_ISSUE };
    await issues.createComment(commentParams);
  }
};

export default { opened };
