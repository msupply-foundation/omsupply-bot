import { Probot } from 'probot';
import nock from 'nock';

import App from '../src';

import { releaseCreated } from './fixtures/release';

nock.disableNetConnect();

describe('release created', () => {
  let probot: Probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(App);
    app.app = () => 'test';
  });

  test('log tag when release is created', async () => {
    const { payload: releasePayload } = releaseCreated;
    const { release: releasePayloadRelease } = releasePayload;
    const { tag_name: buildTag } = releasePayloadRelease;

    let log = '';
    console.log = jest.fn(logString => log += logString);

    await probot.receive({ name: 'release', payload: releasePayload });

    expect(log).toBe(buildTag);
  });
});
