import { SpringValue, animated, to } from "@react-spring/web";
import {
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import imgs from "./AllDirection.data";

import styles from "./AllDirectionStyle.module.css";
import CardSwipe from "./CardSwipe";
import { CardSwipeType } from "./CardSwipe/CardSwipe";
import RejectActionIcon from "./images/RejectActionIcon.svg";
import AcceptActionIcon from "./images/AcceptActionIcon.svg";
import AcceptActionIconSelected from "./images/AcceptActionIconSelected.svg";
import RejectActionIconSelected from "./images/RejectActionIconSelected.svg";
import AskCPAHollowIcon from "./images/AskCPAHollowIcon.svg";
import AskCPAHollowIconSelected from "./images/AskCPAHollowIconSelected.svg";
import { DIRECTIONS, RenderItem } from "./CardSwipe/CardSwipe.types";

function supportsTouchEvents() {
  return typeof window !== "undefined" && "ontouchstart" in window;
}

const ActionIcon = ({
  direction,
  selectOnDirection,
  icon,
  selectedIcon,
  swipe
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
      swipe({direction: selectOnDirection})
    },
    [swipe]
  );
  const onTouchStart: TouchEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.stopPropagation();
      swipe({direction: selectOnDirection})
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

const swipableDirections = [DIRECTIONS.LEFT, DIRECTIONS.TOP, DIRECTIONS.RIGHT];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(imgs.length - 1);
  // const [undoStack, setUndoStack] = useState([]);
  const ref = useRef<CardSwipeType>(null);
  // console.log("currentIndex", currentIndex)
  const renderItem: RenderItem<string> = useCallback(
    ({
      item: img,
      direction,
      index,
      swipe,
    }) => {
      return (
        <div className={styles.card}>
          <div
            className={styles.card__body}
            style={{
              backgroundImage: `url(${img})`,
            }}
          />
          {/* <animated.div>{direction}</animated.div>
          <div>{direction.get()}</div> */}
          <div className={styles.footer}>
            <ActionIcon
              icon={RejectActionIcon}
              selectedIcon={RejectActionIconSelected}
              direction={direction}
              selectOnDirection={DIRECTIONS.LEFT}
              swipe={swipe}
            />
            <ActionIcon
              icon={AskCPAHollowIcon}
              selectedIcon={AskCPAHollowIconSelected}
              direction={direction}
              selectOnDirection={DIRECTIONS.TOP}
              swipe={swipe}
            />
            <ActionIcon
              icon={AcceptActionIcon}
              selectedIcon={AcceptActionIconSelected}
              direction={direction}
              selectOnDirection={DIRECTIONS.RIGHT}
              swipe={swipe}
            />
          </div>
        </div>
      );
    },
    []
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.button}>home</div>
        {/* {undoStack.length > 0 && ( */}
        <div
          className={styles.button}
          onClick={() => {
            // ref.current?.getBack();
            setCurrentIndex(currentIndex + 1);
          }}
        >
          undo
        </div>
        {/* )} */}
        {/* <div
          className={styles.button}
          onClick={() => {
            setCurrentIndex(currentIndex - 1);
          }}
        >
          Redo
        </div> */}
      </div>
      <CardSwipe<string>
        data={imgs}
        ref={ref}
        keyExtractor={({ item: img, index }) => `${index}`}
        swipableDirections={swipableDirections}
        onChange={(newIndex, { index, direction }) => {
          // console.log("direction",newIndex, index, direction);
          // eslint-disable-next-line no-restricted-globals
          const hasConfirmed = confirm("show bottom sheet for irs category");
          if (hasConfirmed) {
            setCurrentIndex(newIndex);
            // setUndoStack(([...currentStack]) => {
            //   currentStack.push({ index, direction });
            //   return currentStack;
            // });
            return true;
          }
          return false;
        }}
        index={currentIndex}
        renderItem={renderItem}
      />
    </div>
  );
}
