const core = require("@actions/core");
const { GitHub, context } = require("@actions/github");

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    const { owner, repo } = context.repo;
    console.log(`Lets go`);

    let releases = await github.repos.listReleases({
      owner,
      repo
    });

    console.log(`Got ${releases.length} releases: ${releases}`);

    const draftRelease = releases.find((r) => r.draft)

    if (draftRelease)
      console.log(`Draft release: ${draftRelease.tag_name}`);

    console.log(`Got ${draftRelease.length} releases: ${draftRelease}`);

    console.log(`Got release info: '${releaseId}', '${htmlUrl}', '${uploadUrl}', '${name}', '${draft}', '${prerelease}', '${body}'`);

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput("id", releaseId.toString());
    core.setOutput("html_url", htmlUrl);
    core.setOutput("upload_url", uploadUrl);
    core.setOutput("tag_name", tag);
    core.setOutput("name", name);
    core.setOutput("body", body);
    core.setOutput("draft", draft);
    core.setOutput("prerelease", prerelease);
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
}

module.exports = run;

