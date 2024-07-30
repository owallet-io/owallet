import style from "./footer.module.scss";
import React, { FC } from "react";
import { useHistory } from "react-router";

const dataFooter = [
  {
    title: "Assets",
    images: require("assets/images/assets-light-inactive.png"),
    imagesActive: require("assets/images/assets-light-active.png"),
    path: "/",
  },
  {
    title: "Activity",
    images: require("assets/images/history-light-inactive.png"),
    imagesActive: require("assets/images/history-light-active.png"),
    path: "/activities",
  },
  {
    title: "Explore",
    images: require("assets/images/explore-light-inactive.png"),
    imagesActive: require("assets/images/explore-light-active.png"),
    path: "/explore",
  },
];
export const Footer = () => {
  const history = useHistory();
  const { pathname } = history.location;
  const toggle = ({ path }) => {
    history.push(path);
  };
  return (
    <div className={style.container}>
      {dataFooter.map((item, index) => (
        <div
          key={index.toString()}
          onClick={() => toggle(item)}
          className={style.wrapItem}
        >
          <img
            className={style.iconBottomTab}
            src={pathname === item.path ? item.imagesActive : item.images}
            alt={item.title}
          />
          <span
            className={style.title}
            style={{
              color: pathname === item.path ? "#5C00A3" : null,
            }}
          >
            {item.title}
          </span>
        </div>
      ))}
    </div>
  );
};
