import { COLUMNS, LABEL_COLUMN, REGEX, LABELS, LABEL_COLUMNS } from '../constants';
import { stringEquals, find, merge, mapFilterNull, mapLookup, zip } from './functions';
import { Project, ColumnMap, Card, Columns, Milestones } from '../types';

export const COLUMN_MAP = new Map<string, string>(zip<string>(COLUMNS.NAMES, COLUMNS.KEYS));
export const LABEL_MAP = new Map<string, string>(zip<string>(LABELS.NAMES, LABELS.KEYS));
export const LABEL_COLUMN_MAP = new Map<string, string>(LABEL_COLUMNS);

export const createColumnLabel = (columnName: string): string =>
  `${toCapitalCase(LABEL_COLUMN.NAME)}: ${columnName}`;

export const filterColumnLabel = ({ name }: { name: string }): boolean =>
  !REGEX.IS_STATUS_LABEL.test(name);

export const findCard = (cards: Card[], issue: { url: string }) => {
  const { url } = issue;
  return find(cards, ({ content_url }) => stringEquals(content_url, url));
};

export const findMilestone = (milestones: Milestones, buildTag: string) =>
  find(milestones, ({title}: {title: string}) => stringEquals(title.replace(/\./g, '-').toLowerCase(), buildTag));

export const findProject = (projects: Project[], projectName: string) =>
  find(projects, ({ name }: { name: string }) => stringEquals(name, projectName));

export const getColumn = (columnName: string): string | undefined => mapLookup(COLUMN_MAP, columnName.toLowerCase());

export const getColumnsMap = (columns: Columns): ColumnMap =>
  merge(
    mapFilterNull(columns, column => {
      const { name } = column;
      const columnKey = getColumn(name);
      return columnKey && { [columnKey]: column };
    })
  ) as ColumnMap;

export const getLabel = (labelName: string): string | undefined => mapLookup(LABEL_MAP, labelName.toLowerCase());

export const getLabelColumn = (labelName: string): string | undefined => mapLookup(LABEL_COLUMN_MAP, getLabel(parseIssueLabel(labelName).toLowerCase()))

export const getMilestoneParam = ({ number }: { number: number }) => number;

export const mapLabelParam = ({ name }: { name: string }) => name;

export const parseIssueLabel = (labelName: string): string => {
  const matches = labelName.match(REGEX.ISSUE_LABEL);
  const [, issueLabel] = matches || [, ''];
  return (issueLabel && issueLabel.toLowerCase()) || '';
};
export const parsePullRequestIssueNumber = (issueBody: string): string => {
  const matches = issueBody.match(REGEX.PR_ISSUE_NUMBER);
  const [, issueNumber] = matches || [, ''];
  return (issueNumber && issueNumber.toLowerCase()) || '';
};

export const parseUrlIssueNumber = (issueUrl: string): string => {
  const matches = issueUrl.match(REGEX.URL_ISSUE_NUMBER);
  const [, issueNumber] = matches || [, ''];
  return issueNumber || '';
};

export const toCapitalCase = ([head, ...tail]: string) =>
  head.toUpperCase() + tail.join('').toLowerCase();
