import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from '@octokit/rest';
const octokit = new Octokit();

export type WorkflowRunDataType = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.actions.getWorkflowRun
>;
