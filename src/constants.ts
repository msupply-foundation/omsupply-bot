export const COLUMNS: { [index: string]: string[] } = {
  KEYS: ['TO_TRIAGE', 'TO_DO', 'TO_PR', 'IN_PR', 'TO_TEST', 'IN_TEST', 'DONE'],
  NAMES: [
    'issue triage',
    'to do',
    'in progress',
    'in pr',
    'needs build testing',
    'in build test',
    'done',
  ],
};

export const COLUMN_LABEL_KEY = 'STATUS';
export const COLUMN_LABEL_NAME = 'status';

export const LABELS: { [index: string]: string[] } = {
  KEYS: [
    'BUG',
    'FEATURE',
    'DOCS',
    'EFFORT',
    'PRIORITY',
    'CUSTOMER',
    'MODULE',
    'STRUCTURE',
    'TYPE',
    'IN_TEST',
    'TESTED',
    'CLOSED',
    COLUMN_LABEL_KEY,
  ],
  NAMES: [
    'bug',
    'feature',
    'docs',
    'effort',
    'priority',
    'customer',
    'module',
    'structure',
    'type',
    'build testing',
    'build tested',
    'closed',
    COLUMN_LABEL_NAME,
  ],
};

export const LABEL_COLUMNS: readonly (readonly [string, string])[] = [
  ['TESTED', 'DONE'],
  ['CLOSED', 'DONE'],
];

export const REGEX: { [index: string]: RegExp } = {
  ISSUE_LABEL: /(.*):/,
  PR_ISSUE_NUMBER: /\#(\d+)/,
  URL_ISSUE_NUMBER: /.*\/(\d+)/,
  IS_STATUS_LABEL: new RegExp(`${COLUMN_LABEL_NAME}:.*`, 'i'),
};

export const ERRORS: { [index: string]: string } = {
  NO_LINKED_ISSUE: 'Beep boop! This pull request does not have an associated issue :(.',
};
