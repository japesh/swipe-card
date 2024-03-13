import { SpringValue, animated, to } from "@react-spring/web";
import { ReactElement, memo, useCallback } from "react";
import { ReactEventHandlers } from "react-use-gesture/dist/types";
import { DIRECTIONS, RenderItem, SwipeFunction } from "./CardSwipe.types";

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
  swipe,
}: {
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
}) {
  const _swipe = useCallback(
    ({ direction }: { direction: DIRECTIONS }) => {
      return swipe({ index, direction });
    },
    [swipe, index]
  );
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
      {renderItem({ item, index, direction: springDirection, swipe: _swipe })}
    </animated.div>
  );
};

export default memo(CardSwipeItem) as typeof CardSwipeItem;
