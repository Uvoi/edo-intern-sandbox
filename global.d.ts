/// <reference types="@astral/ui/declarations" />

declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}
declare module '*.jpeg' {
  const content: string;
  export default content;
}
declare module '*.webp' {
  const content: string;
  export default content;
}
declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '**/shared/static/icons/*.svg' {
  import React from 'react';

  export default React.SFC<React.SVGProps<SVGSVGElement>>;
}

// biome-ignore lint/style/useNamingConvention: <Переопределяет глобальный интерфейс Window>
interface Window {
  __ENV__: {
    PUBLIC_SENTRY_DSN: string;
    PUBLIC_YM_COUNTER_ID: string;
    PUBLIC_STAND: string;
    PUBLIC_RELEASE_VERSION: string;
    PUBLIC_IDENTITY_URL: string;
    PUBLIC_PERSON_AREA_URL: string;
    PUBLIC_DADATA_TOKEN: string;
  };
}
