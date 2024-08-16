import { SpringValue, animated } from "@react-spring/web";
import {
    MouseEventHandler,
    TouchEventHandler,
    useCallback
} from "react";

import styles from "./AllDirectionStyle.module.css";
import { DIRECTIONS } from "./CardSwipe/CardSwipe.types";



function supportsTouchEvents() {
    return typeof window !== "undefined" && "ontouchstart" in window;
  }
  
const ActionIcon = ({
    direction,
    selectOnDirection,
    icon,
    selectedIcon,
    swipe,
  }: {
    direction: SpringValue<DIRECTIONS>;
    selectOnDirection: DIRECTIONS;
    icon: string;
    selectedIcon: string;
    swipe: (args: { direction: DIRECTIONS }) => Promise<void>;
  }) => {
    const onPointerDown: MouseEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        swipe({ direction: selectOnDirection });
      },
      [swipe]
    );
    const onTouchStart: TouchEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        e.stopPropagation();
        swipe({ direction: selectOnDirection });
      },
      [swipe]
    );
    // to prevent use gesture from triggering animation
    const clickProps = supportsTouchEvents()
      ? { onTouchStart }
      : { onPointerDown };
    return (
      <div className={styles.card__action} {...clickProps}>
        <animated.img src={icon} alt="reject" className="disable_gesture" />
        <animated.img
          className={styles.card__action__img}
          src={selectedIcon}
          style={{
            opacity: direction.to(
              [selectOnDirection - 1, selectOnDirection, selectOnDirection, 4],
              [0, 1, 0, 0]
            ),
          }}
          alt="reject"
        />
      </div>
    );
  };

  export default ActionIcon