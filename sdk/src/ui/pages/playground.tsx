import { RuntimeModeEnum } from '@config/defs';
import Locator from '@services/locator';
import { useLocation } from 'react-router-dom';

import { useMemo, useState } from 'react';
import MainPage from './main-page';

import { initServices } from '../../lib-entry';

function Playground() {
  const location = useLocation();

  const [ref, setRef] = useState<number>(0);
  const isAuthenticated = useMemo(() => !!Locator.api.sessionAccessToken, [Locator.api.sessionAccessToken]);
  const [gameID, setGameID] = useState<string>('solitaire');
  const [runtimeMode, setRuntimeMode] = useState<RuntimeModeEnum>(RuntimeModeEnum.DEVELOPMENT);

  const authenticate = async () => {
    initServices({
      gameID,
      runtimeMode: parseInt(runtimeMode as any)
    });

    await Locator.authenticate.loginOrSignUp();
    await Locator.api.getAccess();
    setRef(ref + 1);
  };

  Locator.mainEventBus.detachAll('window');
  Locator.mainEventBus.on('window', (message: string) => {
    try {
      const data = JSON.parse(message);
      switch (data.cmd) {
        case 'close':
          Locator.launcher.show('/');
          setRef(ref + 1);
          break;
      }
    } catch (ex) {}
  });

  return (
    <>
      {!isAuthenticated && (
        <div className="form-control">
          <label className="input-group">
            <span>Game ID</span>
            <input
              type="text"
              className="input input-bordered"
              value={gameID}
              onChange={(e) => setGameID(e.target.value)}
            />
          </label>
          <label className="input-group">
            <span>Runtime Environment</span>
            <select className="select select-bordered" value={runtimeMode} onChange={(e) => setRuntimeMode(e.target.value as any)}>
              <option value={RuntimeModeEnum.LOCAL}>LOCAL</option>
              <option value={RuntimeModeEnum.DEVELOPMENT}>DEVELOPMENT</option>
              <option value={RuntimeModeEnum.PRODUCTION}>PRODUCTION</option>
            </select>
          </label>
          <button className="btn" onClick={() => authenticate()}>
            Authenticate
          </button>
        </div>
      )}
      {(isAuthenticated && (location.pathname === '/')) && (
        <div>
          <button
            className="btn"
            onClick={async () => {
              await Locator.launcher.connect();
              await Locator.launcher.show('/quest-board');
              setRef(ref + 1);
            }}
          >
            Questboard
          </button>
          <button className="btn" onClick={() => Locator.launcher.show('/vault')}>
            Vault
          </button>
          <button className="btn">Leaderboard</button>
        </div>
      )}
      <MainPage />
    </>
  );
}

export default Playground;
