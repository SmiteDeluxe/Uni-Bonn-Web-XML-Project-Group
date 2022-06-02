// Bearbeitet von ***

export default function getEnumKeyByValue<
  K extends string,
  V extends string | number
>(myEnum: { [key in K]: V }, enumValue: V): string {
  const keys = (Object.keys(myEnum) as K[]).filter(
    (x) => myEnum[x] === enumValue
  );
  return keys.length > 0 ? keys[0] : '';
}
