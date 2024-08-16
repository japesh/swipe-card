import { SpringValue } from "@react-spring/web";
import { ForwardedRef, ReactElement } from "react";
import { ReactEventHandlers } from "react-use-gesture/dist/types";

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


export type CardSwipeType = { getBack: () => void };

export type CardSwipeRef = ForwardedRef<CardSwipeType>;

export type CardSwipeProps<ItemType> = {
  data: ItemType[];
  // render item should not be inline
  renderItem: RenderItem<ItemType>;
  keyExtractor?: (args: { item: ItemType; index: number }) => string;
  innerRef?: CardSwipeRef;
  ref?: CardSwipeRef;
  onChange?: (
    newIndex: number,
    args: {
      item: ItemType;
      index: number;
      direction: DIRECTIONS;
    }
  ) => Promise<boolean> | void | boolean;
  index?: number;
  swipableDirections?: DIRECTIONS[];
};

export type CardSwipeItemType<ItemType> = {
  bind: (...args: any[]) => ReactEventHandlers;
  item: ItemType;
  swipe: SwipeFunction;
  scale: SpringValue<number>;
  x: SpringValue<number>;
  y: SpringValue<number>;
  rotateX: SpringValue<number>;
  rotateY: SpringValue<number>;
  rotateZ: SpringValue<number>;
  zoom: SpringValue<number>;
  springDirection: SpringValue<DIRECTIONS>;
  renderItem: RenderItem<ItemType>;
  index: number;
}