import React, {
  CSSProperties,
  FunctionComponent,
  ReactElement,
  useState
} from 'react';

import { MenuProvider, MenuContext } from '../menu';

import { Header, Props as HeaderProps } from '../header';

import style from './style.module.scss';
import { useHistory } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props extends HeaderProps {
  style?: CSSProperties;
}

export const LayoutSpace: FunctionComponent<{
  style?: CSSProperties;
  children?: any;
}> = (props) => {
  const { children, style } = props;
  return <div style={style ?? { padding: 20 }}>{children}</div>;
};

export const LayoutHidePage: FunctionComponent<{
  styleLayout?: CSSProperties;
  children?: any;
  hidePage?: () => void;
  label?: string;
  img?: ReactElement;
}> = (props) => {
  const { styleLayout, hidePage, label, img } = props;
  return (
    <div
      style={styleLayout}
      className={style.layoutHidePage}
      onClick={hidePage}
    >
      <div style={{ paddingRight: 4 }}>{label ?? 'Hide'}</div>
      {img ?? (
        <img
          src={require('../../public/assets/img/shape.svg')}
          alt="total-balance"
        />
      )}
    </div>
  );
};

export const HeaderLayout: FunctionComponent<Props> = (props) => {
  const { children } = props;

  const [isMenuOpen, setMenuOpen] = useState(false);

  const menuContext: MenuContext = {
    open: () => {
      setMenuOpen(true);
    },
    close: () => {
      setMenuOpen(false);
    },
    toggle: () => {
      setMenuOpen(!isMenuOpen);
    }
  };

  const listTabs = ['Home', 'Token', 'Account', 'Menu', 'Chatbot'];
  const history = useHistory();

  const toggle = (tab) => {
    let path = '/';
    switch (listTabs[tab]) {
      case 'Token':
        path = '/token';
        break;
      case 'Account':
        path = '/setting/set-keyring';
        break;
      case 'Menu':
        path = '/menu';
        break;
      case 'Chatbot':
        path = '/chatbot';
        break;
    }
    history.push(path);
  };
  return (
    <MenuProvider value={menuContext}>
      <div className={style.container} style={props.style}>
        <Header
          {...props}
          isMenuOpen={isMenuOpen}
          toggle={toggle}
          listTabs={listTabs}
        />
        <div className={style.innerContainer}>{children}</div>
      </div>
    </MenuProvider>
  );
};
