import { NotFoundPage } from '#shared/components/NotFoundPage';
import { useStore } from '#shared/hooks/useStore';
import { notFoundIllustrationSrc } from '#shared/images/notFoundIllustrationSrc';

import { createUIStore } from './UIStore';

export const NotFoundScreen = () => {
  const { homePagePath } = useStore(createUIStore);

  return (
    <NotFoundPage
      imageSrc={notFoundIllustrationSrc}
      mainPageHref={homePagePath}
    />
  );
};
