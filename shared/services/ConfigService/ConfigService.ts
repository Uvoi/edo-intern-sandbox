type Stand = 'work' | 'staging' | 'production' | 'local';

export class ConfigService {
  public constructor(private readonly _envStore: Record<string, string>) {}

  public get apiUrl(): string {
    return '';
  }

  /**
   * Имя ветки
   */
  public get stand(): Stand {
    return this._envStore.PUBLIC_STAND as Stand;
  }

  public get identityUrl(): string {
    return this._envStore.PUBLIC_IDENTITY_URL;
  }

  public get personAreaUrl(): string {
    return this._envStore.PUBLIC_PERSON_AREA_URL;
  }

  /**
   * Используется для связки выгруженного билда и релиза в sentry
   */
  public get releaseVersion(): string {
    return this._envStore.PUBLIC_RELEASE_VERSION;
  }

  /**
   * Задается в sentry
   */
  public get sentryDsn(): string {
    return this._envStore.PUBLIC_SENTRY_DSN;
  }

  /**
   * Доступ к счетчику есть у PO
   */
  public get ymCounterId(): string {
    return this._envStore.PUBLIC_YM_COUNTER_ID;
  }

  /**
   * Доступ к UXFeedback есть у PO
   */
  public get uxFeedbackId(): string {
    return this._envStore.PUBLIC_UX_FEEDBACK_ID;
  }
}

export const configService = new ConfigService(window.__ENV__);
