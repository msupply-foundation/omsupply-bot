import {
  ReposGetParams,
  IssuesGetParams,
  ProjectsGetColumnParams,
  IssuesUpdateParams,
  IssuesCreateCommentParams,
  ProjectsMoveCardParams,
  ProjectsListForRepoParams,
  ProjectsListColumnsParams,
} from '@octokit/rest';

export type GetRepoParams = ReposGetParams;
export type GetIssueParams = IssuesGetParams;
export type GetColumnParams = ProjectsGetColumnParams;
export type UpdateIssueParams = IssuesUpdateParams;
export type CreateCommentParams = IssuesCreateCommentParams;
export type MoveCardParams = ProjectsMoveCardParams;
export type ListProjectsParams = ProjectsListForRepoParams;
export type ListColumnsParams = ProjectsListColumnsParams;
