import { action } from '../src/action';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  fetchWorkflowRuns,
  fetchCurrentWorkflowRunDetails,
  hasPreviousRunningWorkflows,
} from '../src/github';
import { WorkflowRunDataType } from '../src/types/github';

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('../src/github');

describe('action', () => {
  const mockToken = 'fake-token';
  const mockWorkflowId = 'workflow-id';
  const mockPerPage = 10;
  const mockCurrentRunId = 2;
  const mockWorkflowRunsInProgress: Partial<WorkflowRunDataType>[] = [
    { id: 1, status: 'in_progress', created_at: '2022-01-01T00:00:00Z' },
    { id: 2, status: 'in_progress', created_at: '2022-01-02T00:00:00Z' },
  ];
  const mockWorkflowRunsCompleted: Partial<WorkflowRunDataType>[] = [
    { id: 1, status: 'completed', created_at: '2022-01-01T00:00:00Z' },
    { id: 2, status: 'in_progress', created_at: '2022-01-02T00:00:00Z' },
  ];
  const mockCurrentWorkflowRunDetailsInProgress: Partial<WorkflowRunDataType> =
    {
      id: 2,
      status: 'in_progress',
      created_at: '2022-01-02T00:00:00Z',
    };

  beforeEach(() => {
    jest.clearAllMocks();
    setupInputs();
    setupContextRunId();
  });

  const setupInputs = () => {
    (core.getInput as jest.Mock).mockImplementation((name: string) => {
      switch (name) {
        case 'github-token':
          return mockToken;
        case 'workflow-id':
          return mockWorkflowId;
        case 'results-per-page':
          return mockPerPage;
        default:
          return 10;
      }
    });
  };

  const setupContextRunId = () => {
    (github.context.runId as number) = mockCurrentRunId;
  };

  const setupFetchMocks = (
    workflowRuns: WorkflowRunDataType[],
    currentWorkflowRunDetails: WorkflowRunDataType,
  ) => {
    (fetchWorkflowRuns as jest.Mock).mockResolvedValue(workflowRuns);
    (fetchCurrentWorkflowRunDetails as jest.Mock).mockResolvedValue(
      currentWorkflowRunDetails,
    );
  };

  const setupHasPreviousRunningWorkflowMock = (returnValue: boolean) => {
    (hasPreviousRunningWorkflows as jest.Mock).mockReturnValue(returnValue);
  };

  const executeAction = async () => {
    await action();
  };

  const assertActionOutput = (expectedOutput: string) => {
    const setOutputMock = jest.spyOn(core, 'setOutput');
    expect(setOutputMock).toHaveBeenCalledWith(
      'has-previous-running-workflow',
      expectedOutput,
    );
  };

  it('sets output to true when there are previous running workflows', async () => {
    setupFetchMocks(
      mockWorkflowRunsInProgress as WorkflowRunDataType[],
      mockCurrentWorkflowRunDetailsInProgress as WorkflowRunDataType,
    );
    setupHasPreviousRunningWorkflowMock(true);
    await executeAction();
    assertActionOutput('true');
  });

  it('sets output to false when there are no previous running workflows', async () => {
    setupFetchMocks(
      mockWorkflowRunsCompleted as WorkflowRunDataType[],
      mockCurrentWorkflowRunDetailsInProgress as WorkflowRunDataType,
    );
    setupHasPreviousRunningWorkflowMock(false);
    await executeAction();
    assertActionOutput('false');
  });

  it('calls setFailed when an error occurs', async () => {
    const mockError = new Error('Test error');
    (fetchWorkflowRuns as jest.Mock).mockRejectedValue(mockError);

    const setFailedMock = jest.spyOn(core, 'setFailed');

    await action();

    expect(setFailedMock).toHaveBeenCalledWith(
      `Action failed with error: ${mockError.message}`,
    );
  });
});
