import { DeviceCreate } from '../../models/api/DeviceModels';
import Device from '../../models/internal/Device';

//bearbeitet von ***
export default interface IStorageAdapter<T> {
  create(obj: T extends Device ? DeviceCreate : Omit<T, 'id'>): Promise<string>;
  read(id: string): Promise<T>;
  readAll(): Promise<T[]>;
  update(
    id: string,
    obj: T extends Device ? DeviceCreate : Omit<T, 'id'>
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
