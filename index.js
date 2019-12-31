const core = require('@actions/core');
const github = require('@actions/github');
const atob = require('atob')
const btoa = require('btoa')

// most @actions toolkit packages have async methods
async function run() {
  try {
    const githubToken = core.getInput('myToken');
    const octokit = new github.GitHub(githubToken);

    const [ owner, repo ] = process.env.GITHUB_REPOSITORY.split('/')

    const commit = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: process.env.GITHUB_SHA
    })
    const commitSha = commit.data.sha
    const parentSha = commit.data.parents[0].sha

    const compare = await octokit.repos.compareCommits({
      owner,
      repo,
      base: parentSha,
      head: commitSha
    })

    const { files } = compare.data
    for (let file of files) {
      const blob = await octokit.git.getBlob({
        owner,
        repo,
        file_sha: file.sha
      })
      const raw = atob(blob.data.content)
      const lines = raw.split('\n')
      const newLines = []
      for (let line of lines) {
        let newLine = ''
        if (line.match(/- \[i\] .+/)) {
          const title = line.replace('- [i] ', '')
          const issue = await octokit.issues.create({
            owner,
            repo,
            title
          })
          newLine = `- [#${issue.data.number}](${issue.data.html_url}) ${title}`
        } else {
          newLine = line
        }
        newLines.push(newLine)
      }
      const newRaw = newLines.join('\n')
      await octokit.repos.createOrUpdateFile({
        owner,
        repo,
        path: file.filename,
        sha: file.sha,
        message: 'create issues',
        content: btoa(newRaw)
      })
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }

}

run()
