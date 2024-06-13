import data from './cdk-config-data';
import { RuntimeModeEnum } from './defs';

export class Config {
  constructor () {    
  }

  public getData (runtime: RuntimeModeEnum) {
    switch (runtime) {
      case RuntimeModeEnum.LOCAL:
        return {
          ...data.dev['platform-dev-fullstack'],
          userAPIUrl: 'http://localhost:3000/'
        }
        break;

      case RuntimeModeEnum.PRODUCTION:
        return data.pro['platform-pro-fullstack'];
    }
    return data.dev['platform-dev-fullstack'];
  }
}
