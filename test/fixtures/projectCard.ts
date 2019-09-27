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

const ISSUE = {
    TRIAGED_ISSUE: {
        "url": "https://api.github.com/repos/sussol/msupply/issues/4125",
        "body": "This issue is triaged.",
        "number": 4125,
        "user": USER.SUSSOL,
        "labels": [],
        "repository": REPOSITORY.MSUPPLY
    }
}

const COLUMN = {
    TRIAGE_COLUMN: {
        "id": 5755854
    }
}

  
  const PROJECT_CARD = {
    TRIAGED_ISSUE_CARD: {
        "content_url": ISSUE.TRIAGED_ISSUE.url,
        "column_id": COLUMN.TRIAGE_COLUMN.id,
    },
  }

  const ACTION = {
    PROJECT_CARD: {
      MOVED: "moved",
    }
  }
  
  const PAYLOAD = {
    CARD_MOVED: {
      action: ACTION.PROJECT_CARD.MOVED,
      project_card: PROJECT_CARD.TRIAGED_ISSUE_CARD,
      repository: REPOSITORY.MSUPPLY
    },
  }
  
  export const projectCardMoved = { payload: PAYLOAD.CARD_MOVED, issue: ISSUE.TRIAGED_ISSUE };