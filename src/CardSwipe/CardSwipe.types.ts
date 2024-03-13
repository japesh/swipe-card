import { SpringValue } from "@react-spring/web";
import { ReactElement } from "react";

export enum DIRECTIONS {
  TOP = 4,
  LEFT = 1,
  RIGHT = 3,
  BOTTOM = 2,
  NONE = 0,
}

export type SwipeFunction = (args: {
  index: number;
  direction: DIRECTIONS;
}) => Promise<void>;

export type RenderItem<ItemType> = (args: {
  item: ItemType;
  index: number;
  direction: SpringValue<DIRECTIONS>;
  swipe: (args: { direction: DIRECTIONS }) => Promise<void>;
}) => ReactElement;
