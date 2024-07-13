import * as github from '@actions/github';
import {
  fetchWorkflowRuns,
  fetchCurrentWorkflowRunDetails,
  hasPreviousRunningWorkflows,
} from '../src/github';
import { WorkflowRunDataType } from '../src/types/github';

jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'mock-owner',
      repo: 'mock-repo',
    },
  },
  getOctokit: jest.fn(),
}));

describe('github', () => {
  let getOctokitMock: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    getOctokitMock = github.getOctokit as jest.MockedFunction<any>;
  });

  const token = 'fake-token';
  const workflowId = 'workflow-id';
  const perPage = 10;
  const currentRunId = 1;

  const workflowRuns: Partial<WorkflowRunDataType>[] = [
    {
      id: 1,
      status: 'in_progress',
      created_at: '2022-01-01T00:00:00Z',
    },
    {
      id: 2,
      status: 'in_progress',
      created_at: '2022-01-02T00:00:00Z',
    },
  ];

  const currentWorkflowRunDetails: Partial<WorkflowRunDataType> = {
    id: 2,
    status: 'in_progress',
    created_at: '2022-01-02T00:00:00Z',
  };

  describe('fetchWorkflowRuns', () => {
    it('fetches workflow runs', async () => {
      const requestMock = jest.fn().mockResolvedValue({
        data: { workflow_runs: workflowRuns },
      });
      getOctokitMock.mockReturnValue({ request: requestMock });

      const result = await fetchWorkflowRuns(token, workflowId, perPage);

      expect(getOctokitMock).toHaveBeenCalled();
      expect(requestMock).toHaveBeenCalledWith(
        'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
        {
          owner: 'mock-owner',
          repo: 'mock-repo',
          workflow_id: workflowId,
          per_page: perPage,
        },
      );

      expect(result).toEqual(workflowRuns);
    });
  });

  describe('fetchCurrentWorkflowRunDetails', () => {
    it('fetches current workflow run details', async () => {
      const requestMock = jest.fn().mockResolvedValue({
        data: currentWorkflowRunDetails,
      });
      getOctokitMock.mockReturnValue({ request: requestMock });

      const result = await fetchCurrentWorkflowRunDetails(token, currentRunId);

      expect(getOctokitMock).toHaveBeenCalled();
      expect(requestMock).toHaveBeenCalledWith(
        'GET /repos/{owner}/{repo}/actions/runs/{run_id}',
        {
          owner: 'mock-owner',
          repo: 'mock-repo',
          run_id: currentRunId,
        },
      );

      expect(result).toEqual(currentWorkflowRunDetails);
    });
  });

  describe('hasPreviousRunningWorkflows', () => {
    it('detects previous running workflows', () => {
      const result = hasPreviousRunningWorkflows(
        workflowRuns as WorkflowRunDataType[],
        currentWorkflowRunDetails as WorkflowRunDataType,
      );
      expect(result).toBe(true);
    });

    it('returns false when there are no previous running workflows', () => {
      const noRunningWorkflows: Partial<WorkflowRunDataType>[] = [
        {
          id: 1,
          status: 'completed',
          created_at: '2022-01-01T00:00:00Z',
        },
      ];

      const result = hasPreviousRunningWorkflows(
        noRunningWorkflows as WorkflowRunDataType[],
        currentWorkflowRunDetails as WorkflowRunDataType,
      );
      expect(result).toBe(false);
    });
  });
});
