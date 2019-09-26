const USER = {
  SUSSOL: {
    "login": "sussol",
  }
}

const REPOSITORY = {
  MSUPPLY: {
    "name": "msupply",
    "owner": USER.SUSSOL,
  }
}

const PULL_REQUEST = {
  NO_ISSUE: {
    "body": "This PR has no issue.",
    "number": 1,
    "user": USER.SUSSOL,
    "repository": REPOSITORY.MSUPPLY
  },
  LINKED_ISSUE: {
    "body": "Fixes #1",
    "number": 2,
    "user": USER.SUSSOL,
    "repository": REPOSITORY.MSUPPLY
  }
}

const ISSUE = {
  NO_LABELS_NO_MILESTONE: {
    "body": "This issue has no labels and no milestone.",
    "number": 1,
    "user": USER.SUSSOL,
    "repository": REPOSITORY.MSUPPLY
  }
}

const ACTION = {
  PULL_REQUEST: {
    OPENED: "opened",
  }
}

const PAYLOAD = {
  PULL_REQUEST_OPENED_NO_ISSUE: {
    action: ACTION.PULL_REQUEST.OPENED,
    pull_request: PULL_REQUEST.NO_ISSUE,
    repository: REPOSITORY.MSUPPLY
  },
  PULL_REQUEST_OPENED_WITH_ISSUE: {
    action:  ACTION.PULL_REQUEST.OPENED,
    pull_request: PULL_REQUEST.LINKED_ISSUE,
    repository: REPOSITORY.MSUPPLY
  }
}

export const pullRequestOpenedWithoutIssue = { payload: PAYLOAD.PULL_REQUEST_OPENED_NO_ISSUE };
export const pullRequestOpenedWithIssue = { 
  payload: PAYLOAD.PULL_REQUEST_OPENED_WITH_ISSUE,
  issue: ISSUE.NO_LABELS_NO_MILESTONE
};