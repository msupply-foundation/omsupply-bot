import { Context } from 'probot';
import { GitHubAPI } from 'probot/lib/github'
import { ReleasePayload, RepositoryPayload, Release, MilestonesResponse, Milestones, Milestone } from '../types';
import { ListMilestonesParams, ListIssuesForRepoParams, UpdateReleaseParams } from '../types/params';
import { findMilestone, getIssueNotes } from '../helpers';
// @ts-ignore
import { getIssuesByMilestone }  from '../../changes-log/changesLogGenerator.js';

export const created = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: ReleasePayload } = context;
  const { issues, repos } = github;
  const { release, repository }: { release: Release, repository: RepositoryPayload } = payload;
  const { tag_name: buildTag, id: releaseId }: { tag_name: string, id: number } = release;

  const releaseParams = context.repo();

  const listMilestonesParams: ListMilestonesParams = { ...releaseParams }
  const milestonesResult: MilestonesResponse = await issues.listMilestonesForRepo(listMilestonesParams);
  const { data: repoMilestones }: { data: Milestones } = milestonesResult;
  const releaseMilestone: Milestone | undefined = findMilestone(repoMilestones, buildTag);

  if (releaseMilestone) {
    const { number: milestoneNumber } = releaseMilestone;
    const issueMilestone: string = String(milestoneNumber);
    const params = {
      milestone: issueMilestone, 
      duplicate: false, 
      filters: '"Status: In PR"',  // Change to use constants
      groups: ['Feature: new', 'Feature: existing', 'Bug: production'], // Change to use constants
      owner: releaseParams.owner,
      repo: releaseParams.repo
    }
    const issues: Array<Object> | [] = await getIssuesByMilestone(params); 
    
    console.log('Issues count', issues.length);

    if( issues.length > 0) console.log(issues[0]);
    
      // const releaseUpdateParams: UpdateReleaseParams = { ...releaseParams, release_id: releaseId, body: JSON.stringify(issues) }
      // await repos.updateRelease(releaseUpdateParams);

  } else {
    console.log('Do something about problem to find a milestone relssted to the New Release!');
  }
};

export default { created };
