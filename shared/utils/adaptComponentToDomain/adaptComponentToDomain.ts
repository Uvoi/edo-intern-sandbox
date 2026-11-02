import {
  createElement,
  type FunctionComponent,
  type ReactElement,
} from 'react';

export type RenderComponentInDomain<TProps extends object> = (
  props: TProps,
) => ReactElement;

/**
 * Позволяет использовать react-компонент в бизнес-логике как render функцию
 */
export const adaptComponentToDomain =
  <TProps extends object>(
    component: FunctionComponent<TProps>,
  ): RenderComponentInDomain<TProps> =>
  (props) =>
    createElement(component, props);
