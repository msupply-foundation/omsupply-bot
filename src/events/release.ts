import { Context } from 'probot';
import { GitHubAPI } from 'probot/lib/github'
import { ReleasePayload, RepositoryPayload, Release, MilestonesResponse, Milestones, Milestone } from '../types';
import { ListMilestonesParams, ListIssuesForRepoParams } from '../types/params';
import { findMilestone } from '../helpers';

export const created = async (context: Context) => {
  const { github, payload }: { github: GitHubAPI; payload: ReleasePayload } = context;
  const { issues } = github;
  const { release, repository }: { release: Release, repository: RepositoryPayload } = payload;
  const { tag_name: buildTag }: { tag_name: string } = release;

  const releaseParams = context.repo();

  const listMilestonesParams: ListMilestonesParams = { ...releaseParams }
  const milestonesResult: MilestonesResponse = await issues.listMilestonesForRepo(listMilestonesParams);
  const { data: repoMilestones }: { data: Milestones } = milestonesResult;
  const releaseMilestone: Milestone | undefined = findMilestone(repoMilestones, buildTag);

  if (releaseMilestone) {
    const { number: milestoneNumber } = releaseMilestone;
    const issueMilestone: string = String(milestoneNumber);
    console.log('issueMilestone', issueMilestone, milestoneNumber, releaseMilestone);
    
    const repoIssuesParams: ListIssuesForRepoParams = { ...releaseParams, milestone: issueMilestone }
    const releaseIssues = await issues.listForRepo(repoIssuesParams); 

    console.log(releaseIssues);
    
  } else {
    console.log('Do something about problem to find a milestone relssted to the New Release!');
  }
};

export default { created };
