import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

import { ApiProvider } from '@app/api';
import { LocalizationProvider } from '@app/providers/localization';
import { RuntimeModeEnum } from '@config/defs.ts';

import Locator from './services/locator';
import TraceKit from './services/trace-kit';
import MainPage from './ui/pages/main-page';

import './index.scss';

function createApp(root: HTMLElement) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <LocalizationProvider>
        <ApiProvider>
          <MemoryRouter initialEntries={['/']}>
            <MainPage />
          </MemoryRouter>
        </ApiProvider>
      </LocalizationProvider>
    </React.StrictMode>
  );
}

export function initServices(opts: { gameID: string; runtimeMode: RuntimeModeEnum }) {
  Locator.init(opts);
  Locator.launcher.init();
  Locator.authenticate.init(opts);
  Locator.api.init(opts);
}

export function init(opts: { gameID: string; runtimeMode: RuntimeModeEnum }) {
  initServices(opts);

  TraceKit.report.subscribe((stackInfo) => Locator.api.sendStackTrace(stackInfo));

  var root = document.createElement('div');
  root.id = 'root';
  root.style.position = 'absolute';
  root.style.left = '0px';
  root.style.top = '0px';
  root.style.width = '100%';
  root.style.height = '100%';
  root.style.background = 'none';
  root.style.backgroundColor = 'transparent';
  root.style.display = 'none';
  document.body.appendChild(root);

  createApp(root);
}
