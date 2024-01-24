import React from 'react';
import { OptionEnum } from './enum';
import style from './style.module.scss';

export const Dropdown = ({ chosenOption, dispatch }) => {
  return (
    <select
      className={style.inputBox}
      defaultValue={OptionEnum.ORAIDEX}
      value={chosenOption}
      onChange={(evt) =>
        dispatch({ type: 'choose_option', payload: evt.target.value })
      }
    >
      <option value={OptionEnum.ORAIDEX}>Oraidex</option>
      <option value={OptionEnum.SWAP}>Swap</option>
    </select>
  );
};
