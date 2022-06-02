export enum PlaceholderDelimiter {
  OPEN = '${',
  CLOSE = '}',
}

export type PlaceholderString =
  `${string}${PlaceholderDelimiter.OPEN}${string}${PlaceholderDelimiter.CLOSE}${string}`;

type PlaceholderUnion<P extends string> =
  P extends `\${${infer Param}}${infer Rest}`
    ? Param | PlaceholderUnion<Rest>
    : P extends `\${${infer Param}}`
    ? Param
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    P extends `${infer Prefix}${PlaceholderDelimiter.OPEN}${infer Param}${PlaceholderDelimiter.CLOSE}${infer Rest}`
    ? Param | PlaceholderUnion<`${Rest}`>
    : never;

export type PlaceholderValues<T extends PlaceholderString> = {
  [k in PlaceholderUnion<T>]: string;
};
