import { Context } from "probot";
import { GitHubAPI } from "probot/lib/github";

import { ProjectCardPayload, Card } from "./types";
import { parseUrlIssueNumber, mapLabelParam, filterColumnLabel, createColumnLabel } from "./helpers";

export const moved = async (context: Context) => {
    const { github, payload }: { github: GitHubAPI; payload: ProjectCardPayload } = context;
    const { issues, projects } = github;
    const { project_card: card }: { project_card: Card } = payload;
    const { column_id: columnId,  content_url: issueUrl }: { column_id: number,  content_url: string } = card;
    const columnParams = { column_id: columnId };
    const column = await projects.getColumn(columnParams);
    const { data: columnData } = column;
    const { name: columnName } = columnData;
    const issueNumber = parseUrlIssueNumber(issueUrl);
    const issueParams = context.issue({number: issueNumber});
    const issue = await issues.get(issueParams);
    const { data: issueData } = issue;
    const { labels: issueLabels } = issueData;
    const labelParams = issueLabels.filter(filterColumnLabel).map(mapLabelParam);
    const columnLabelParam = createColumnLabel(columnName);
    await issues.update({...issueParams, labels: [...labelParams, columnLabelParam]});
  };

export default { moved };