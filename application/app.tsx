import { observer } from 'mobx-react-lite';
import { RouterProvider as ReactRouterProvider } from 'react-router-dom';

import { initMainApiHttpClient } from '#api/services/MainApiHttpClient';
import { ConfigProvider } from '#shared/components/ConfigProvider';
import { NotificationContainer } from '#shared/components/Notification';
import { ThemeProvider } from '#shared/components/ThemeProvider';
import { TECH_SUPPORT } from '#shared/constants/contacts';
import { errorIllustrationSrc } from '#shared/images/errorIllustrationSrc';
import { noDataIllustrationSrc } from '#shared/images/noDataIllustrationSrc';
import { outdatedReleaseIllustrationSrc } from '#shared/images/outdatedReleaseIllustrationSrc';
import { configService } from '#shared/services/ConfigService';
import { monitoringErrorService } from '#shared/services/MonitoringErrorService';
import { theme } from '#shared/theme';

import { browserRouter } from './routes';

monitoringErrorService.init({
  dsn: configService.sentryDsn,
  releaseVersion: configService.releaseVersion,
  stand: configService.stand,
});

initMainApiHttpClient();

export const App = observer(() => {
  return (
    <ConfigProvider
      captureException={monitoringErrorService.captureException}
      imagesMap={{
        noDataImgSrc: noDataIllustrationSrc,
        defaultErrorImgSrc: errorIllustrationSrc,
        outdatedReleaseErrorImgSrc: outdatedReleaseIllustrationSrc,
      }}
      techSup={TECH_SUPPORT}
    >
      <ThemeProvider theme={theme}>
        <NotificationContainer />
        <ReactRouterProvider router={browserRouter} />
      </ThemeProvider>
    </ConfigProvider>
  );
});
