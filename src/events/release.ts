import { Context } from 'probot';
import { GitHubAPI } from 'probot/lib/github'
import { ReleasePayload } from '../types';
import { Release } from '../types';

export const created = async (context: Context) => {
  const { payload }: { github: GitHubAPI; payload: ReleasePayload } = context;
  const { release }: { release: Release } = payload;
  const { tag_name: buildTag }: { tag_name: string } = release;
  console.log(buildTag);
};

export default { created };
