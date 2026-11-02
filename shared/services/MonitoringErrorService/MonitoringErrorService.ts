import { captureException, init, replayIntegration } from '@sentry/browser';

import { configService } from '../ConfigService';

type MonitoringErrorServiceConfig = {
  dsn: string;
  stand: string;
  releaseVersion: string;
};

class MonitoringErrorService {
  public captureException = captureException;

  public init = (config: MonitoringErrorServiceConfig) => {
    init({
      dsn: config.dsn,
      release: config.releaseVersion,
      environment: config.stand,
      enabled: configService.stand !== 'local',
      integrations: [
        replayIntegration({
          maskAllText: false,
          blockAllMedia: true,
        }),
      ],
      // Tracing
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
  };
}

export const monitoringErrorService = new MonitoringErrorService();
