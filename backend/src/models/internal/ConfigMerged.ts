import ConfigContent from '../config/ConfigContent';
import Device from './Device';

export default interface ConfigMerged extends Omit<ConfigContent, 'devices'> {
  devices: Device[];
}
