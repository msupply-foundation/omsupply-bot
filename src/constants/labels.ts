import { COLUMN_DONE } from './columns';
import { zip } from '../helpers/functions';

export const LABEL_BUG = {
  KEY: 'BUG',
  NAME: 'bug',
};

export const LABEL_FEATURE = {
  KEY: 'FEATURE',
  NAME: 'feature',
};

export const LABEL_DOCS = {
  KEY: 'DOCS',
  NAME: 'docs',
};

export const LABEL_EFFORT = {
  KEY: 'EFFORT',
  NAME: 'effort',
};

export const LABEL_PRIORITY = {
  KEY: 'PRIORITY',
  NAME: 'priority',
};

export const LABEL_CUSTOMER = {
  KEY: 'CUSTOMER',
  NAME: 'customer',
};

export const LABEL_MODULE = {
  KEY: 'MODULE',
  NAME: 'module',
};

export const LABEL_STRUCTURE = {
  KEY: 'STRUCTURE',
  NAME: 'structure',
};

export const LABEL_TYPE = {
  KEY: 'TYPE',
  NAME: 'type',
};

export const LABEL_IN_TEST = {
  KEY: 'IN_TEST',
  NAME: 'in test',
};

export const LABEL_TESTED = {
  KEY: 'TESTED',
  NAME: 'tested',
};

export const LABEL_CLOSED = {
  KEY: 'CLOSED',
  NAME: 'closed',
};

export const LABEL_COLUMN = {
  KEY: 'STATUS',
  NAME: 'status',
};

export const LABELS: { [index: string]: string[] } = {
  KEYS: [
    LABEL_BUG.KEY,
    LABEL_FEATURE.KEY,
    LABEL_DOCS.KEY,
    LABEL_EFFORT.KEY,
    LABEL_PRIORITY.KEY,
    LABEL_CUSTOMER.KEY,
    LABEL_MODULE.KEY,
    LABEL_STRUCTURE.KEY,
    LABEL_TYPE.KEY,
    LABEL_IN_TEST.KEY,
    LABEL_TESTED.KEY,
    LABEL_CLOSED.KEY,
    LABEL_COLUMN.KEY,
  ],
  NAMES: [
    LABEL_BUG.NAME,
    LABEL_FEATURE.NAME,
    LABEL_DOCS.NAME,
    LABEL_EFFORT.NAME,
    LABEL_PRIORITY.NAME,
    LABEL_CUSTOMER.NAME,
    LABEL_MODULE.NAME,
    LABEL_STRUCTURE.NAME,
    LABEL_TYPE.NAME,
    LABEL_IN_TEST.NAME,
    LABEL_TESTED.NAME,
    LABEL_CLOSED.NAME,
    LABEL_COLUMN.NAME,
  ],
};

export const LABEL_COLUMNS: readonly (readonly [string, string])[] = [
  [LABEL_TESTED.KEY, COLUMN_DONE.KEY],
  [LABEL_CLOSED.KEY, COLUMN_DONE.KEY],
];

export const LABEL_MAP = new Map<string, string>(zip<string>(LABELS.NAMES, LABELS.KEYS));
export const LABEL_COLUMN_MAP = new Map<string, string>(LABEL_COLUMNS);
