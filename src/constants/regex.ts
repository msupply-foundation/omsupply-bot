import { LABEL_COLUMN } from './labels';

export const REGEX: { [index: string]: RegExp } = {
    ISSUE_LABEL: new RegExp(/(.*):/),
    PR_ISSUE_NUMBER: new RegExp(/\#(\d+)/),
    URL_ISSUE_NUMBER: new RegExp(/.*\/(\d+)/),
    IS_STATUS_LABEL: new RegExp(`${LABEL_COLUMN.NAME}:.*`, 'i'),
  };
