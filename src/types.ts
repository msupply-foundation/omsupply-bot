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
  PullRequestsGetResponse,
  PullRequestsListResponseItem,
  IssuesGetResponseLabelsItem,
  Response,
  IssuesGetResponseMilestone,
  ProjectsListForRepoParams,
  ProjectsListColumnsParams,
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
  WebhookPayloadIssuesIssueLabelsItem,
  WebhookPayloadProject,
  WebhookPayloadProjectProject,
  WebhookPayloadProjectColumn,
  WebhookPayloadProjectColumnProjectColumn,
  WebhookPayloadIssuesIssueMilestone,
} from '@octokit/webhooks';

export type RepoResponse = Response<Repo>;
export type IssueResponse = Response<Issue>;
export type LabelResponse = Response<Label>;
export type ProjectResponse = Response<Project>;
export type ProjectsResponse = Response<Projects>;
export type ColumnResponse = Response<Column>;
export type ColumnsResponse = Response<Columns>;
export type CardResponse = Response<Card>;
export type CardsResponse = Response<Cards>;
export type PullRequestResponse = Response<PullRequest>;

export type Repo = ReposGetResponse & PayloadRepository;
export type Issue = IssuesGetResponse & WebhookPayloadIssuesIssue;
export type Label = IssuesGetResponseLabelsItem &
  WebhookPayloadLabelLabel &
  WebhookPayloadIssuesIssueLabelsItem;
export type Milestone = IssuesGetResponseMilestone & WebhookPayloadIssuesIssueMilestone;
export type Project = ProjectsListForRepoResponseItem & WebhookPayloadProjectProject;
export type Column = ProjectsListColumnsResponseItem & WebhookPayloadProjectColumnProjectColumn;
export type Card = ProjectsListCardsResponseItem & WebhookPayloadProjectCardProjectCard;
export type PullRequest = PullRequestsListResponseItem & WebhookPayloadPullRequestPullRequest;

export type Repos = Array<Repo>;
export type Issues = Array<Issue>;
export type Labels = Array<Label>;
export type Milestones = Array<Milestone>;
export type Projects = Array<Project>;
export type Columns = Array<Column>;
export type Cards = Array<Card>;
export type PullRequests = Array<PullRequest>;

export type ColumnMap = { [index: string]: Column };

export type IssuePayload = WebhookPayloadIssues & { issue: Issue };
export type LabelPayload = WebhookPayloadLabel & { label: Label };
export type RepositoryPayload = PayloadRepository;
export type IssueLabelPayload = IssuePayload & LabelPayload;
export type PullRequestPayload = WebhookPayloadPullRequest & { pull_request: PullRequest };
export type ProjectCardPayload = WebhookPayloadProjectCard & { project_card: Card };

export type GetRepoParams = ReposGetParams;
export type GetIssueParams = IssuesGetParams;
export type GetColumnParams = ProjectsGetColumnParams;
export type UpdateIssueParams = IssuesUpdateParams;
export type CreateCommentParams = IssuesCreateCommentParams;
export type MoveCardParams = ProjectsMoveCardParams;
export type ListProjectsParams = ProjectsListForRepoParams;
export type ListColumnsParams = ProjectsListColumnsParams;

export type XMLElement = { parent: XMLElement; name: string; value: string };
