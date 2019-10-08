import { zip } from "../helpers/functions";

export const COLUMN_TRIAGE = {
  KEY: 'TO_TRIAGE',
  NAME: 'issue triage',
};

export const COLUMN_TO_DO = {
  KEY: 'TO_DO',
  NAME: 'to do',
};

export const COLUMN_TO_PR = {
  KEY: 'TO_PR',
  NAME: 'in progress',
};

export const COLUMN_IN_PR = {
  KEY: 'IN_PR',
  NAME: 'in progress',
};

export const COLUMN_TO_TEST = {
  KEY: 'TO_TEST',
  NAME: 'needs build testing',
};

export const COLUMN_IN_TEST = {
  KEY: 'IN_TEST',
  NAME: 'in build test',
};

export const COLUMN_DONE = {
  KEY: 'DONE',
  NAME: 'done',
};

export const COLUMNS: { [index: string]: string[] } = {
  KEYS: [
    COLUMN_TRIAGE.KEY,
    COLUMN_TO_DO.KEY,
    COLUMN_TO_PR.KEY,
    COLUMN_IN_PR.KEY,
    COLUMN_TO_TEST.KEY,
    COLUMN_IN_TEST.KEY,
    COLUMN_DONE.KEY,
  ],
  NAMES: [
    COLUMN_TRIAGE.NAME,
    COLUMN_TO_DO.NAME,
    COLUMN_TO_PR.NAME,
    COLUMN_IN_PR.NAME,
    COLUMN_TO_TEST.NAME,
    COLUMN_IN_TEST.NAME,
    COLUMN_DONE.NAME,
  ],
};