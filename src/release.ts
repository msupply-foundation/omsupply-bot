import { Context } from 'probot';
import { GitHubAPI } from 'probot/lib/github';
import { WebhookPayloadRelease, WebhookPayloadReleaseRelease } from '@octokit/webhooks';
import { updateBuildSpec } from './jenkins';

export const created = async (context: Context) => {
  const { payload }: { github: GitHubAPI; payload: WebhookPayloadRelease } = context;
  const { release }: { release: WebhookPayloadReleaseRelease } = payload;
  const { tag_name: buildTag }: { tag_name: string } = release;

  console.log(buildTag);

  await updateBuildSpec(buildTag);
};

export default { created };
