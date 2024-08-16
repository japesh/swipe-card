import { useSprings } from "@react-spring/web";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGesture } from "react-use-gesture";
import {
  CardSwipeProps,
  CardSwipeRef,
  DIRECTIONS,
  SwipeFunction,
} from "./CardSwipe.types";
import CardSwipeItem from "./CardSwipeItem";
import { calcX, calcY, defaultKeyExtractor, getSwipeOutStyles } from "./utils";

const initialPosition = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  zoom: 0,
  x: 0,
  y: 0,
};

const MIN_DISTANCE_FOR_SWIPE = 5;

function CardSwipe<ItemType>({
  data,
  renderItem,
  keyExtractor = defaultKeyExtractor,
  innerRef,
  onChange,
  index,
  swipableDirections,
}: CardSwipeProps<ItemType>) {
  const _swipableDirections = useMemo(() => {
    if (swipableDirections) {
      return new Set(swipableDirections);
    }
    return new Set([
      DIRECTIONS.LEFT,
      DIRECTIONS.RIGHT,
      DIRECTIONS.TOP,
      DIRECTIONS.BOTTOM,
    ]);
  }, [swipableDirections]);
  const _index = useRef(data.length - 1);
  // change it with loading state which is easy to understand
  const [enabled, setEnableState] = useState(true);
  // console.log("enabled>>>>>>", index, _index.current, enabled);
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, []);

  const [springProps, api] = useSprings(
    data.length,
    () => ({
      ...initialPosition,
      config: { mass: 5, tension: 350, friction: 40 },
    }),
    []
  );
  const [springDirectionProps, springDirectionAPI] = useSprings(
    data.length,
    () => ({
      direction: 0,
      config: { round: 1, bounce: 0 },
    }),
    []
  );

  const swipe: SwipeFunction = useCallback(
    async ({ index: cardIndex, direction: swipeDirection }) => {
      setEnableState(false);
      const { _x, _y, rotateZ } = getSwipeOutStyles({ swipeDirection });
      await Promise.all(
        api.start((i) => {
          if (cardIndex !== i) return;
          return {
            x: _x,
            y: _y,
            rotateX: 0,
            rotateY: 0,
            scale: 1.1,
            rotateZ: rotateZ,
            config: {
              mass: 5,
              tension: 200,
              friction: 40,
              duration: 500,
            },
          };
        })
      );
      if (onChange) {
        const isDone = await onChange(_index.current, {
          item: data[cardIndex],
          index: cardIndex,
          direction: swipeDirection,
        });
        if (isDone === false) {
          _index.current++;
          await api.start((i) => {
            if (cardIndex !== i) return;
            return {
              ...initialPosition,
              config: {
                mass: 5,
                tension: 200,
                friction: 40,
              },
            };
          })[0];
        }
        setEnableState(true);
      }
    },
    [onChange, api.start, data]
  );

  const bind = useGesture(
    {
      onDrag: async ({
        active,
        movement: [x, y],
        velocity,
        args: [cardIndex],
        ...rest
      }) => {
        // const uniqueIdentifier = keyExtractor({item: data[cardIndex], index: cardIndex});
        // console.log("rest", cardIndex, rest);
        // console.log("currentIndex>>>>>>> ondrag", index)
        // trigger can consider if card is near edges or not
        const trigger = velocity > 0.2;
        let swipeDirection = DIRECTIONS.NONE;
        const isMovingVertically = Math.abs(x) < Math.abs(y);
        if (isMovingVertically) {
          if (y < -MIN_DISTANCE_FOR_SWIPE) {
            swipeDirection = DIRECTIONS.TOP;
          } else if (y > MIN_DISTANCE_FOR_SWIPE) {
            swipeDirection = DIRECTIONS.BOTTOM;
          }
        } else {
          if (x < -MIN_DISTANCE_FOR_SWIPE) {
            swipeDirection = DIRECTIONS.LEFT;
          } else if (x > MIN_DISTANCE_FOR_SWIPE) {
            swipeDirection = DIRECTIONS.RIGHT;
          }
        }

        if (!active && trigger && _swipableDirections.has(swipeDirection)) {
          _index.current = cardIndex - 1;
          // gone.add(cardIndex);
          // return;
        }
        const isGone = cardIndex > _index.current;
        let { _x, _y, rotateZ } = getSwipeOutStyles({
          swipeDirection,
          x,
          y,
          isGone,
        });

        if (isGone && onChange && swipeDirection) {
          setEnableState(false);
        }

        // reduce the number of loop
        springDirectionAPI.set((i) => {
          if (cardIndex !== i) return {};
          return {
            direction: active && !isGone ? swipeDirection : DIRECTIONS.NONE,
          };
        });

        const arrayResponse = api.start((i) => {
          if (cardIndex !== i) return;
          return {
            x: active || isGone ? _x : 0,
            y: active || isGone ? _y : 0,
            rotateX: 0,
            rotateY: 0,
            scale: active ? 1 : 1.1,
            rotateZ: active ? rotateZ : 0,
            config: {
              mass: 5,
              tension: active ? 800 : isGone ? 200 : 350,
              friction: 40,
              ...(isGone ? { duration: 500 } : {}),
            },
          };
        });
        const response = await arrayResponse[0];
        if (isGone && onChange && swipeDirection) {
          // gone.delete(cardIndex);
          const isDone = await onChange(_index.current, {
            item: data[cardIndex],
            index: cardIndex,
            direction: swipeDirection,
          });
          if (isDone === false) {
            _index.current++;
            await api.start((i) => {
              if (cardIndex !== i) return;
              return {
                ...initialPosition,
                config: {
                  mass: 5,
                  tension: 200,
                  friction: 40,
                },
              };
            })[0];
          }
          setEnableState(true);
        }
        // console.log("response", response);
      },
      onPinch: ({ offset: [d, a], args: [cardIndex] }) =>
        api.start((i) => {
          if (cardIndex !== i) return;
          return { zoom: d / 200, rotateZ: a };
        }),
      onMove: ({ xy: [px, py], dragging, args: [cardIndex] }) =>
        !dragging &&
        api.start((i) => {
          if (cardIndex !== i) return;

          const { x, y } = springProps[i];
          return {
            rotateX: calcX(py, y.get()),
            rotateY: calcY(px, x.get()),
            scale: 1.1,
          };
        }),
      onHover: ({ hovering, args: [cardIndex] }) =>
        !hovering &&
        api.start((i) => {
          if (cardIndex !== i) return;
          return { rotateX: 0, rotateY: 0, scale: 1 };
        }),
    },
    { eventOptions: { passive: false }, enabled }
  );

  useImperativeHandle(
    innerRef,
    () => {
      return {
        getBack: () => {},
      };
    },
    []
  );

  useEffect(() => {
    if (index !== undefined && index !== _index.current && api) {
      api.set((i) => {
        if (i <= index) {
          return initialPosition;
        } else if (i <= _index.current) {
          return {
            x: 200 + window.innerWidth,
            y: 200 + window.innerHeight,
            // rotateX: 0,
            // rotateY: 0,
            scale: 1,
            // rotateZ: 0,
          };
        }
        return {};
      });
      _index.current = index;
    }
  }, [index]);

  return (
    <>
      {data.map((item, i) => {
        return (
          <CardSwipeItem<ItemType>
            item={item}
            key={keyExtractor({ item, index: i })}
            bind={bind}
            {...springProps[i]}
            springDirection={springDirectionProps[i].direction}
            renderItem={renderItem}
            index={i}
            swipe={swipe}
          />
        );
      })}
    </>
  );
}

export default forwardRef(function <ItemType>(
  props: CardSwipeProps<ItemType>,
  ref: CardSwipeRef
) {
  return <CardSwipe {...props} innerRef={ref} />;
}) as typeof CardSwipe;
