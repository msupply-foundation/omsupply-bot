import {
  WebhookPayloadPullRequestPullRequest,
  PayloadRepository,
  WebhookPayloadIssuesIssue,
  WebhookPayloadLabelLabel,
  WebhookPayloadIssuesIssueLabelsItem,
  WebhookPayloadIssuesIssueMilestone,
  WebhookPayloadProjectProject,
  WebhookPayloadProjectColumnProjectColumn,
  WebhookPayloadProjectCardProjectCard,
} from '@octokit/webhooks';
import {
  PullRequestsListResponseItem,
  ReposGetResponse,
  IssuesGetResponse,
  IssuesGetResponseLabelsItem,
  IssuesGetResponseMilestone,
  ProjectsListForRepoResponseItem,
  ProjectsListColumnsResponseItem,
  ProjectsListCardsResponseItem,
  Response,
} from '@octokit/rest';

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
