import { getInput, setOutput, setFailed } from '@actions/core';
import {
  fetchWorkflowRuns,
  fetchCurrentWorkflowRunDetails,
  hasPreviousRunningWorkflows,
} from './github';
import { context } from '@actions/github';

export const action = async () => {
  try {
    const token = getInput('github-token', { required: true });
    const workflowId = getInput('workflow-id', { required: true });
    const perPage = parseInt(getInput('results-per-page', { required: true }));

    const workflowRuns = await fetchWorkflowRuns(token, workflowId, perPage);
    const currentRunId = context.runId;
    const currentWorkflowRunDetails = await fetchCurrentWorkflowRunDetails(
      token,
      currentRunId,
    );

    const hasPreviousRunningWorkflow = hasPreviousRunningWorkflows(
      workflowRuns,
      currentWorkflowRunDetails,
    );

    setOutput(
      'has-previous-running-workflow',
      hasPreviousRunningWorkflow ? 'true' : 'false',
    );
  } catch (error: any) {
    setFailed(`Action failed with error: ${error.message}`);
  }
};
