const RELEASE = {
    RELEASE: {
        tag_name: "0.0.1",
    }
}

const ACTION = {
    CREATED: "created",
}

const PAYLOAD = {
    RELEASE_CREATED: {
        action: ACTION.CREATED,
        release: RELEASE.RELEASE
    },
}

export const releaseCreated = { payload: PAYLOAD.RELEASE_CREATED }