# Action Workflow Cancel

A simple Github Action to support my Minesweeper Game by checking for already running workflows.

## Usage

Use it like this for example:

```yml
- name: Check for previous running workflows
  id: check_previous_workflows
  uses: agonyz/action-workflow-cancel@0.0.1
  with:
    workflow-id: 'main.yml'
```

## Inputs

```yml
github-token:
  description: 'A personal access token or the github token with read-access for actions. If none is provided it will use the default github token.'
  default: ${{ github.token }}
  required: false

workflow-id:
  description: 'The workflow id that this job should monitor. You can also use a filename like "main.yml".'
  required: true

results-per-page:
  description: 'The number of workflow runs to retrieve per page.'
  default: '10'
  required: false
```

## Permissions

You need to specify the following permission scopes for this action to work correctly:

```ỳml
permissions:
  contents: read
  actions: read
```
