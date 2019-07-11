import { Application, Context } from 'probot'
import { WebhookPayloadPullRequest, WebhookPayloadPullRequestPullRequest } from '@octokit/webhooks'
import { IssuesGetResponse, Response } from '@octokit/rest';

type PullRequestComment = {number: any} & {owner: string, repo: string} & { body: string};

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], async (context: Context) => {
    const { payload }: { event: string, payload: WebhookPayloadPullRequest } = context;   
    const { pull_request: pullRequest }: { pull_request: WebhookPayloadPullRequestPullRequest} = payload;
    const { body }: { body: string } = pullRequest;
  
    context.log(body);

    const issueRegex: RegExp = /\#(\d+)/;
    const regexMatch: RegExpExecArray | null = issueRegex.exec(body);

    if (regexMatch) {
      const regexResult: string = regexMatch[1];
      const number: number = parseInt(regexResult);

      if (number) {
        context.log(`PR opened for issue #${number}.`);

        const owner: string = "sussol";
        const repo: string = "msupply";
        const { data }: Response<IssuesGetResponse> = await context.github.issues.get({owner, repo, number});

        const body = `
          Beep boop. This PR is associated with issue #${number}.

          Labels: ${data.labels.map(label => label.name).join(", ")}
        `;

        const pullRequestComment: PullRequestComment = context.issue({ body });
        await context.github.issues.createComment(pullRequestComment);

      } else {
        context.log(`PR opened with no or incorrectly formatted issue number.`);

        const body = 'Beep boop. This PR does not have an associated issue!';
      
        const pullRequestComment: PullRequestComment = context.issue({ body });
        await context.github.issues.createComment(pullRequestComment);
      }
    }
  });
}