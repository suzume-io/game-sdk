import { Config } from '@config/config';
import { RuntimeModeEnum } from '@config/defs';
import ApiService from '@services/api';
import Authenticate from '@services/authenticate';
import EventBus from '@services/event-bus';
import Launcher from '@services/launcher';
import Telegram from '@services/telegram';

export class LocatorService {
  public gameID: string;
  public runtimeMode: RuntimeModeEnum;

  public mainEventBus: EventBus;
  public uiEventBus: EventBus;
  public apiEventBus: EventBus;

  public config: Config;
  public launcher: Launcher;
  public telegram: Telegram;
  public authenticate: Authenticate;
  public api: ApiService;

  constructor() {
    this.gameID = '';
    this.runtimeMode = RuntimeModeEnum.DEVELOPMENT;

    this.config = new Config();
    this.mainEventBus = new EventBus();
    this.uiEventBus = new EventBus();
    this.apiEventBus = new EventBus();

    this.launcher = new Launcher(this);
    this.telegram = new Telegram(this);
    this.authenticate = new Authenticate(this, this.config);
    this.api = new ApiService(this, this.config);
  }

  public init(opts: { gameID: string, runtimeMode: RuntimeModeEnum }) {
    this.gameID = opts.gameID;
    this.runtimeMode = opts.runtimeMode;
  }
}

export default new LocatorService();
