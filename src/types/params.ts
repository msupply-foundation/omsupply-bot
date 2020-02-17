import {
  ReposGetParams,
  IssuesGetParams,
  ProjectsGetColumnParams,
  IssuesUpdateParams,
  IssuesCreateCommentParams,
  IssuesListMilestonesForRepoParams,
  ProjectsMoveCardParams,
  ProjectsListForRepoParams,
  ProjectsListColumnsParams,
  ReposUpdateReleaseParams,
} from '@octokit/rest';

export type GetRepoParams = ReposGetParams;
export type GetIssueParams = IssuesGetParams;
export type GetColumnParams = ProjectsGetColumnParams;
export type UpdateIssueParams = IssuesUpdateParams;
export type UpdateReleaseParams = ReposUpdateReleaseParams;
export type CreateCommentParams = IssuesCreateCommentParams;
export type MoveCardParams = ProjectsMoveCardParams;
export type ListProjectsParams = ProjectsListForRepoParams;
export type ListColumnsParams = ProjectsListColumnsParams;
export type ListMilestonesParams = IssuesListMilestonesForRepoParams;
