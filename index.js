const core = require('@actions/core');
const github = require('@actions/github');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const githubToken = core.getInput('myToken');
    console.log(githubToken)
    const octokit = new github.GitHub(githubToken);

    const [ GITHUB_USER, GITHUB_REPOS ] = process.env.GITHUB_REPOSITORY.split('/')

    const commit = await octokit.git.getCommit({
      owner: GITHUB_USER,
      repo: GITHUB_REPOS,
      commit_sha: process.env.GITHUB_SHA,
      mediaType: { format: 'diff' }
    })
    const commitSha = commit.data.sha
    const parentSha = commit.data.parents[0].sha
    console.log(commitSha, parentSha)
    const compareData = await octokit.repos.compareCommits({
      owner: GITHUB_USER,
      repo: GITHUB_REPOS,
      base: parentSha,
      head: commitSha
    })
    console.log(compareData)
  }
  catch (error) {
    core.setFailed(error.message);
  }

}

run()
