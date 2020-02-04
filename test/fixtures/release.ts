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

const RELEASE = {
    RELEASE_1: {
        tag_name: "V1-01-00"
    },
    RELEASE_2: {
        tag_name: "V1-02-00"
    },
    RELEASE_NEW: {
        tag_name: "V1-03-00",
        target_commitish: "master",
        name: "v1.3.0",
        body: "Description of the release",
        draft: false,
        prerelease: false
    }
}

const MILESTONE = {
    MILESTONE_V1_01: {
        "title": "v1.01.00",
        "number": 1,
        "open_issues": 0,
        "closed_issues": 1,
        "state": "closed"
    },
    MILESTONE_V1_02: {
        "title": "v1.02.00",
        "number": 2,
        "open_issues": 0,
        "closed_issues": 1,
        "state": "closed"
    },
    MILESTONE_V1_03: {
        "title": "v1.03.00",
        "number": 3,
        "open_issues": 2,
        "closed_issues": 3,
        "state": "closed"
    },
}

const ISSUE = {
    ISSUE_1: {
        "number": 1,
        "title": "Issue #1",
        "state": "open",
        "user": USER.SUSSOL,
        "milestone": MILESTONE.MILESTONE_V1_03
    },
    ISSUE_2: {
        "number": 2,
        "title": "Issue #2",
        "state": "open",
        "user": USER.SUSSOL,
        "milestone": MILESTONE.MILESTONE_V1_03
    },
    ISSUE_3: {
        "number": 3,
        "title": "Issue #3",
        "state": "closed",
        "user": USER.SUSSOL,
        "milestone": MILESTONE.MILESTONE_V1_03
    },
    ISSUE_4: {
        "number": 4,
        "title": "Issue #4",
        "state": "closed",
        "user": USER.SUSSOL,
        "milestone": MILESTONE.MILESTONE_V1_03
    },
    ISSUE_5: {
        "number": 5,
        "title": "Issue #5",
        "state": "closed",
        "user": USER.SUSSOL,
        "milestone": MILESTONE.MILESTONE_V1_03
    },
    ISSUE_6: {
        "number": 6,
        "title": "Issue #6",
        "state": "closed",
        "user": USER.SUSSOL,
        "milestone": MILESTONE.MILESTONE_V1_01
    },
    ISSUE_7: {
        "number": 7,
        "title": "Issue #7",
        "state": "closed",
        "user": USER.SUSSOL,
        "milestone": MILESTONE.MILESTONE_V1_02
    }
}

const ACTION = {
    CREATED: "created",
}

const PAYLOAD = {
    RELEASE_CREATED: {
        action: ACTION.CREATED,
        repository: REPOSITORY.MSUPPLY,
        release: RELEASE.RELEASE_NEW,
        issues: [ ISSUE.ISSUE_1, ISSUE.ISSUE_2, ISSUE.ISSUE_3, ISSUE.ISSUE_4, ISSUE.ISSUE_5, ISSUE.ISSUE_6 ]
    }
}

export const releaseCreated = { payload: PAYLOAD.RELEASE_CREATED }
export const repoMilestones = [ MILESTONE.MILESTONE_V1_01, MILESTONE.MILESTONE_V1_02, MILESTONE.MILESTONE_V1_03 ]
export const linkedMilestone = MILESTONE.MILESTONE_V1_03
export const linkedIssues = [ ISSUE.ISSUE_1, ISSUE.ISSUE_2, ISSUE.ISSUE_3, ISSUE.ISSUE_4, ISSUE.ISSUE_5 ]