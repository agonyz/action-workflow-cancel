import { getInput, setFailed, setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

async function run() {
  try {
    const token = getInput('github-token', { required: true });
    const workflowId = getInput('workflow-id', { required: true });
    const perPage = parseInt(getInput('results-per-page', { required: true }));

    const octokit = getOctokit(token);
    const { owner, repo } = context.repo;
    const currentRunId = context.runId;

    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
      {
        owner,
        repo,
        workflow_id: workflowId,
        per_page: perPage,
      },
    );

    const responseCurrent = await octokit.request(
      'GET /repos/{owner}/{repo}/actions/runs/{run_id}',
      {
        owner,
        repo,
        run_id: currentRunId,
      },
    );

    const waiting_for = response.data.workflow_runs
      .filter(
        (run) =>
          run.status &&
          [
            'in_progress',
            'queued',
            'waiting',
            'pending',
            'action_required',
            'requested',
          ].includes(run.status),
      )
      .filter((run) => run.id !== currentRunId)
      .filter(
        (run) =>
          new Date(run.created_at).getTime() <
          new Date(responseCurrent.data.created_at).getTime(),
      );

    const hasAlreadyRunningJob = waiting_for.length > 0 ? 'true' : 'false';
    setOutput('has-already-running-job', hasAlreadyRunningJob);
  } catch (error) {
    setFailed(`Action failed with error: ${error}`);
  }
}

run();
