import { Application, Context } from 'probot'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], async (context: Context) => {
    const { payload } = context;   
    const { pull_request } = payload;
    const { body } = pull_request;

    const issueRegex = /\#(\d+)/;
    const regexMatch = issueRegex.exec(body);

    if (regexMatch) {
      const regexResult = regexMatch[1];
      const number = parseInt(regexResult);

      if (number) {
        const owner = "sussol";
        const repo = "msupply";

        const { data } = await context.github.issues.get({owner, repo, number});
        const labels = data.labels.map(label => label.name)

        const body = `Beep boop. This PR is associated with issue #${number}.`;

        const comment = context.issue({ body });

        await context.github.issues.createComment(comment);
        await context.github.issues.addLabels(context.issue({ labels }));

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