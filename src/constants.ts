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
  ],
};

export const LABEL_COLUMNS: readonly (readonly [string, string])[] = [
  ['TESTED', 'DONE'],
  ['CLOSED', 'DONE'],
];

export const REGEX: { [index: string]: RegExp } = {
  ISSUE_NUMBER: /\#(\d+)/,
  ISSUE_LABEL: /(.*):/,
};

export const ERRORS: { [index: string]: string } = {
  NO_LINKED_ISSUE: 'Beep boop! This pull request does not have an associated issue :(.',
};
