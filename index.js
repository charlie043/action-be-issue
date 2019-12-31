const core = require('@actions/core');
const github = require('@actions/github');
const atob = require('atob')

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
    const compare = await octokit.repos.compareCommits({
      owner: GITHUB_USER,
      repo: GITHUB_REPOS,
      base: parentSha,
      head: commitSha
    })
    console.log(compare.data.files)
    const file = compare.data.files[0]
    const blob = await octokit.git.getBlob({
      owner: GITHUB_USER,
      repo: GITHUB_REPOS,
      file_sha: file.sha
    })

    const raw = atob(blob.data.content)
    console.log(raw)
    console.log(raw.split('\n'))

  }
  catch (error) {
    core.setFailed(error.message);
  }

}

run()
