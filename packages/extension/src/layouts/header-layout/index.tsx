import React, { CSSProperties, FunctionComponent, useState } from 'react';

import { MenuProvider, MenuContext } from '../menu';

import { Header, Props as HeaderProps } from '../header';

import style from './style.module.scss';
import { useHistory } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props extends HeaderProps {
  style?: CSSProperties;
}

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

  const listTabs = ['Home', 'Token', 'Account', 'Menu'];
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
        path = '/setting/language';
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
