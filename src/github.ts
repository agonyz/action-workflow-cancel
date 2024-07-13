import { context, getOctokit } from '@actions/github';
import { WorkflowRunDataType } from './types/github';

export const fetchWorkflowRuns = async (
  token: string,
  workflowId: string,
  perPage: number,
): Promise<WorkflowRunDataType[]> => {
  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;

  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
    {
      owner,
      repo,
      workflow_id: workflowId,
      per_page: perPage,
    },
  );

  return response.data.workflow_runs;
};

export const fetchCurrentWorkflowRunDetails = async (
  token: string,
  currentRunId: number,
): Promise<WorkflowRunDataType> => {
  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;

  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/runs/{run_id}',
    {
      owner,
      repo,
      run_id: currentRunId,
    },
  );

  return response.data;
};

export const hasPreviousRunningWorkflows = (
  workflowRuns: WorkflowRunDataType[],
  currentWorkflowRunDetails: WorkflowRunDataType,
) => {
  return (
    workflowRuns
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
      .filter((run) => run.id !== currentWorkflowRunDetails.id)
      .filter(
        (run) =>
          new Date(run.created_at).getTime() <
          new Date(currentWorkflowRunDetails.created_at).getTime(),
      ).length > 0
  );
};
