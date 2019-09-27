export const distinct = <T>(a: readonly T[]): T[] => Array.from(new Set(a));

export const filter = <T>(a: readonly T[], f: (_: T) => boolean): T[] => a.filter(f);

export const filterNull = <T>(a: readonly T[]): NonNullable<T>[] => mapNull(filter(a, isNull));

export const find = <T>(a: readonly T[], f: (_: T) => boolean): T | undefined =>
  a.find(f) || undefined;

export const isNull = <T>(v: T): boolean => v != null && v != undefined;

export const flat = <T>(a: readonly T[][]): T[] => a.flat();

export const flatMap = <T, U>(a: readonly T[], f: (v: T, i: number) => U[]): U[] => a.flatMap(f);

export const map = <T, U>(a: readonly T[], f: (v: T, i: number) => U): U[] => a.map(f);

export const merge = (a: Object[]): Object =>
  reduce(a, (acc: Object, curr: Object) => ({ ...acc, ...curr }));

export const mapDistinct = <T, U>(a: readonly T[], f: (_: T) => U): U[] => distinct(map(a, f));

export const mapFilter = <T, U>(a: readonly T[], f: (_: T) => U, g: (_: U) => boolean): U[] =>
  filter(map(a, f), g);

export const mapFilterNull = <T, U>(a: readonly T[], f: (_: T) => U): NonNullable<U>[] =>
  filterNull(map(a, f));

export const mapLookup = <T, U>(m: Map<T, U>, k: T): U | undefined => m.get(k);

export const mapMerge = <T>(a: readonly T[], f: (_: T) => Object): Object => merge(map(a, f));

export const mapNull = <T>(a: readonly T[]): NonNullable<T>[] => map(a, v => v!);

export const mapReduce = <T, U>(a: readonly T[], f: (_: T) => U, g: (acc: U, curr: U) => U): U =>
  reduce(map(a, f), g);

export const flatMapPromise = async <T, U>(
  a: readonly T[],
  f: (_: T) => Promise<U[]>
): Promise<U[]> => Promise.all(map(a, f)).then(flat);

export const mapPromise = async <T, U>(a: readonly T[], f: (_: T) => Promise<U>): Promise<U[]> =>
  Promise.all(map(a, f));

export const reduce = <T>(a: readonly T[], f: (acc: T, curr: T) => T): T => a.reduce(f);

export const zip = <T>(a: readonly T[], b: readonly T[]): [T, T][] => map(a, (v, i) => [v, b[i]]);

export const stringEquals = (s: string, w: string) => s.toLowerCase() == w.toLowerCase();
