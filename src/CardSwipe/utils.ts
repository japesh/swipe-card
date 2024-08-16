import { DIRECTIONS } from "./CardSwipe.types";

export const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) / 20;
export const calcY = (x: number, lx: number) =>
  (x - lx - window.innerWidth / 2) / 20;

export const defaultKeyExtractor = ({ index }: { item: any; index: number }) =>
  `${index}`;

export const getSwipeOutStyles = ({
  swipeDirection,
  x = 0,
  y = 0,
  isGone = true,
}: {
  swipeDirection: DIRECTIONS;
  x?: number;
  y?: number;
  isGone?: boolean;
}) => {
  let rotateZ = 0,
    _x = x,
    _y = y;
  switch (swipeDirection) {
    case DIRECTIONS.LEFT: {
      rotateZ = -10;
      if (isGone) {
        _x = -(200 + window.innerWidth);
      }
      break;
    }
    case DIRECTIONS.RIGHT: {
      rotateZ = 10;
      if (isGone) _x = 200 + window.innerWidth;
      break;
    }
    case DIRECTIONS.TOP: {
      if (isGone) {
        _y = -(200 + window.innerHeight);
      }
      break;
    }
    case DIRECTIONS.BOTTOM: {
      if (isGone) _y = 200 + window.innerHeight;
      break;
    }
  }
  return { _x, _y, rotateZ };
};
