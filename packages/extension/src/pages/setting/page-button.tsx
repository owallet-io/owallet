import React, { FunctionComponent } from 'react';

import classnames from 'classnames';

import stylePageButton from './page-button.module.scss';

export const PageButton: FunctionComponent<
  {
    title: string;
    paragraph?: string;
    subParagraph?: string;
    icons?: React.ReactElement[];
    styleTitle?: React.CSSProperties;
    styleParagraph?: React.CSSProperties;
  } & React.HTMLAttributes<HTMLDivElement>
> = (props) => {
  const { title, paragraph, subParagraph, icons, styleTitle, styleParagraph } =
    props;

  const attributes = { ...props };
  delete attributes.paragraph;
  delete attributes.subParagraph;
  delete attributes.icons;

  return (
    <div
      className={classnames(stylePageButton.container, {
        [stylePageButton.withSubParagraph]: subParagraph != null
      })}
      {...attributes}
    >
      <div className={stylePageButton.innerContainer}>
        <h1 style={styleTitle}>{title}</h1>
        {paragraph ? <p style={styleParagraph}>{paragraph}</p> : null}
        {subParagraph ? <p>{subParagraph}</p> : null}
      </div>
      <div style={{ flex: 1 }} />
      {icons
        ? icons.map((icon, i) => {
            return (
              <div className={stylePageButton.iconContainer} key={i.toString()}>
                <div style={{ flex: 1 }} />
                {icon}
                <div style={{ flex: 1 }} />
              </div>
            );
          })
        : null}
    </div>
  );
};
