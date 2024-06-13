import TraceKit from './services/trace-kit';
import Locator from '@services/locator';

export * from '@config/defs';
export * from './lib-entry';

export const launcher = Locator.launcher;
export const authenticate = Locator.authenticate;
export const telegram = Locator.telegram;
export const api = Locator.api;
export const apiEventBus = Locator.apiEventBus;
export const traceKit = TraceKit;
