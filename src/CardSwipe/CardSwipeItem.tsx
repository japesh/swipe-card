import { animated, to } from "@react-spring/web";
import { memo, useCallback } from "react";
import { CardSwipeItemType, DIRECTIONS } from "./CardSwipe.types";

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
}: CardSwipeItemType<ItemType>) {
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
