// users:
//   - id: ***
//     name: ***
//     deviceRestrictions:
//      - kitchenLamp
//      - 50c2a204-e6cd-4c87-af19-2a1f01202aae
//     groupRestrictions:
//      - livingRoom

export default interface UserConfig {
  id: string;
  name: string;
  deviceRestrictions: string[];
  groupRestrictions: string[];
}
