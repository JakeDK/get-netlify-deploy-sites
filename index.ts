import * as core from '@actions/core';
import * as github from '@actions/github';
const axios = require('axios');
const sites: Array<string> = JSON.parse(core.getInput('sites'));

async function prLink(): Promise<void> {
  try {
    const token = core.getInput('github-token');
    const octokit = github.getOctokit(token);
    const context = github.context;

    const response = await octokit.rest.pulls.list({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'closed',
      per_page: 4,
      base: 'release-v*'
    });

    if (!response.data) return;

    console.log(response);
    const releasePr = response.data.filter(item => item.title.indexOf('Release v') !== -1)[0];
    console.log(releasePr);
    core.setOutput('pr', `[PR](${releasePr})`);
  } catch (error) {
    console.log(error);
  }
}

async function run(): Promise<void> {
  try {
    const netlifyToken: string = core.getInput('netlifyToken');
    const response = await axios.get('https://api.netlify.com/api/v1/sites?filter=all', { headers: {
      'Authorization' : `Bearer ${netlifyToken}`
    }})
  
    if (!response.data) return;
    generateDeployUrls(response.data);
  } catch (error) {
    console.log(error);
  }
}

function generateDeployUrls(data: Array<{ name: string, deploy_id: string }>) {
  const site: {[index: string]: any} = {};
  const result: any | undefined = sites.map(siteName => {
    const netlifySite = data.find(nSite => nSite.name === siteName);
    if (!netlifySite) return;
      
    return {
      site: siteName,
      deployUrl: `https://app.netlify.com/sites/${netlifySite.name}/deploys/${netlifySite.deploy_id}`
    }
  });

  return setOutput(result);
}


/**
 * Setup action output values
 * @param release - founded release
 */
function setOutput(netlifySites: Array<{ site: string, deployUrl: string }>): void {
  const list = JSON.stringify(netlifySites.map(item => (`[Latest stable deploy ${item.site}](${item.deployUrl})`)))
  core.setOutput('netlifySites', `${list.replace(/"\\n/g, '').replace(/,/g, '\n').replace(/"/g, '').replace(/^\[([\s\S]*)]$/, "$1")}`);
}

prLink();
run();
