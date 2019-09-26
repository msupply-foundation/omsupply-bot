import {
  ProjectsListForRepoResponseItem,
  ProjectsListCardsResponseItem,
  ProjectsListColumnsResponseItem,
  ProjectsMoveCardParams,
  ReposGetResponse,
  IssuesGetResponse,
  IssuesGetParams,
  ReposGetParams,
  IssuesCreateCommentParams,
  IssuesUpdateParams,
  ProjectsGetColumnParams,
} from '@octokit/rest';
import {
  WebhookPayloadIssuesIssue,
  WebhookPayloadPullRequest,
  WebhookPayloadIssues,
  WebhookPayloadLabel,
  WebhookPayloadLabelLabel,
  WebhookPayloadPullRequestPullRequest,
  WebhookPayloadProjectCard,
  WebhookPayloadProjectCardProjectCard,
  PayloadRepository,
  WebhookPayloadProjectCardSender,
  WebhookPayloadRepository,
} from '@octokit/webhooks';

export type Repo = ReposGetResponse;
export type Issue = IssuesGetResponse;
export type Project = ProjectsListForRepoResponseItem;
export type Column = ProjectsListColumnsResponseItem;
export type Card = ProjectsListCardsResponseItem & projectCardPayloadProjectCard & WebhookPayloadProjectCardProjectCard
export type ColumnMap = { [index: string]: Column };

export type IssuePayload = WebhookPayloadIssues;
export type LabelPayload = WebhookPayloadLabel;
export type RepositoryPayload = PayloadRepository;
export type IssueLabelPayload = IssuePayload & LabelPayload;
export type PullRequestPayload = WebhookPayloadPullRequest;
export type ProjectCardPayload = {
  action: string,
  project_card: Card,
  repository: PayloadRepository,
  sender: WebhookPayloadProjectCardSender,
}

 

export type GetRepoParams = ReposGetParams;
export type GetIssueParams = IssuesGetParams;
export type GetColumnParams = ProjectsGetColumnParams;
export type UpdateIssueParams = IssuesUpdateParams;
export type CreateCommentParams = IssuesCreateCommentParams;
export type MoveCardParams = ProjectsMoveCardParams;


export type IssuePayloadIssue = WebhookPayloadIssuesIssue;
export type LabelPayloadLabel = WebhookPayloadLabelLabel;
export type PullRequestPayloadPullRequest = WebhookPayloadPullRequestPullRequest;
export type projectCardPayloadProjectCard = WebhookPayloadProjectCardProjectCard

export type XMLElement = { parent: XMLElement; name: string; value: string };
