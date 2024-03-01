import { SpringValue, animated, to } from "@react-spring/web";
import { ReactElement, memo } from "react";
import { ReactEventHandlers } from "react-use-gesture/dist/types";
import { DIRECTIONS } from "./CardSwipe.types";

const CardSwipeItem = function <ItemType>({
  item,
  bind,
  x,
  y,
  rotateX,
  rotateY,
  rotateZ,
  zoom,
  scale,
  renderItem,
  springDirection,
  index,
}: {
  bind: (...args: any[]) => ReactEventHandlers;
  item: ItemType;

  scale: SpringValue<number>;
  x: SpringValue<number>;
  y: SpringValue<number>;
  rotateX: SpringValue<number>;
  rotateY: SpringValue<number>;
  rotateZ: SpringValue<number>;
  zoom: SpringValue<number>;
  springDirection: SpringValue<DIRECTIONS>;
  renderItem: (args: {
    item: ItemType;
    index: number;
    direction: SpringValue<DIRECTIONS>;
  }) => ReactElement;
  index: number;
}) {
  return (
    <animated.div
      {...bind(index)}
      style={{
        transform: "perspective(600px)",
        x,
        y,
        scale: to([scale, zoom], (s, z) => s + z),
        rotateX,
        rotateY,
        rotateZ,
        position: "absolute",
      }}
    >
      {renderItem({ item, index, direction: springDirection })}
    </animated.div>
  );
};

export default memo(CardSwipeItem) as typeof CardSwipeItem;
