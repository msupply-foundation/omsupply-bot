import { Application, Context } from 'probot'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], async (context: Context) => {
    const { payload } = context;   
    const { pull_request } = payload;
    const { body } = pull_request;

    const issueRegex = /\#(\d+)/;
    const issueRegexMatch = issueRegex.exec(body);

    if (issueRegexMatch) {
      const issueRegexResult = issueRegexMatch[1];
      const number = parseInt(issueRegexResult);

      if (number) {
        const owner = "sussol";
        const repo = "msupply";

        const issue = await context.github.issues.get({owner, repo, number});
        const labels = issue.data.labels.map(label => label.name)

        const body = `Beep boop. This PR is associated with issue #${number}.`;

        const comment = context.issue({ body });

        await context.github.issues.createComment(comment);
        await context.github.issues.addLabels(context.issue({ labels }));

        const projects = await context.github.projects.listForRepo({ owner, repo});
        if (projects) {
          const project = projects.data[0];

          if (project) {
            const columns = await context.github.projects.listColumns({ project_id: project.id })
            context.log(columns);
            if (columns) {
              const columnDoing = columns.data.find(column => column.name === "In progress");
              const columnInPR = columns.data.find(column => column.name === "In PR");
              if (columnDoing && columnInPR) {
                const cardsDoing = await context.github.projects.listCards({ column_id: columnDoing.id })
                if (cardsDoing) {
                  const cardIssue = cardsDoing.data.find(card => card.content_url === issue.data.url);
                  if (cardIssue) {
                    await context.github.projects.moveCard({ card_id: cardIssue.id, position: 'top', column_id: columnInPR.id })
                  }
                }
              }
            }
          }
        }

        context.log(`PR opened for issue #${number}.`);
      } else {
        const body = 'Beep boop. This PR does not have an associated issue!';
      
        const comment = context.issue({ body });

        await context.github.issues.createComment(comment);

        context.log(`PR opened with no or incorrectly formatted issue number.`);
      }
    }
  });
}