import { TypeTextAndCustomizeComponent } from './types';

export const checkFnComponent = (
  titleRight: TypeTextAndCustomizeComponent,
  Element: React.ReactNode
) => {
  if (!!titleRight) {
    if (typeof titleRight === 'string') {
      return Element;
    } else if (typeof titleRight === 'function') {
      return titleRight();
    }
    return titleRight;
  }
  return null;
};
