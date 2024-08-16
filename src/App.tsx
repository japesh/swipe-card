import {
  useCallback,
  useRef,
  useState,
} from "react";
import imgs from "./data";

import ActionIcon from "./ActionIcons";
import styles from "./AllDirectionStyle.module.css";
import CardSwipe from "./CardSwipe";
import { CardSwipeType, DIRECTIONS, RenderItem } from "./CardSwipe/CardSwipe.types";
import AcceptIcon from "./images/AcceptIcon.svg";
import AcceptIconSelected from "./images/AcceptIconSelected.svg";
import ManIcon from "./images/ManIcon.svg";
import ManIconSelected from "./images/ManIconSelected.svg";
import RejectIcon from "./images/RejectIcon.svg";
import RejectIconSelected from "./images/RejectIconSelected.svg";



const swipableDirections = [DIRECTIONS.LEFT, DIRECTIONS.TOP, DIRECTIONS.RIGHT];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(imgs.length - 1);
  // const [undoStack, setUndoStack] = useState([]);
  const ref = useRef<CardSwipeType>(null);
  // console.log("currentIndex", currentIndex)
  const renderItem: RenderItem<string> = useCallback(
    ({ item: img, direction, index, swipe }) => {
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
              icon={RejectIcon}
              selectedIcon={RejectIconSelected}
              direction={direction}
              selectOnDirection={DIRECTIONS.LEFT}
              swipe={swipe}
            />
            <ActionIcon
              icon={ManIcon}
              selectedIcon={ManIconSelected}
              direction={direction}
              selectOnDirection={DIRECTIONS.TOP}
              swipe={swipe}
            />
            <ActionIcon
              icon={AcceptIcon}
              selectedIcon={AcceptIconSelected}
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
          let message = "show confirm action";
          if (direction === DIRECTIONS.LEFT) {
            setCurrentIndex(newIndex);
            return true;
          } else if (direction === DIRECTIONS.TOP) {
            message = "show confirm action for top direction";
          }

          const hasConfirmed = window.confirm(message);
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
