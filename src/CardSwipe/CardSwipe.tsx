import { SpringValue, useSprings } from "@react-spring/web";
import {
  ForwardRefExoticComponent,
  ForwardedRef,
  PropsWithoutRef,
  ReactElement,
  RefAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useGesture } from "react-use-gesture";
import CardSwipeItem from "./CardSwipeItem";
import { DIRECTIONS } from "./CardSwipe.types";

const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;

const defaultKeyExtractor = ({ index }: { item: any; index: number }) =>
  `${index}`;

type Props<ItemType> = {
  data: ItemType[];
  renderItem: (args: {
    item: ItemType;
    index: number;
    direction: SpringValue<DIRECTIONS>;
  }) => ReactElement;
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
};

export type CardSwipeType = { getBack: () => void };

type CardSwipeRef = ForwardedRef<CardSwipeType>;

const initialPosition = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  zoom: 0,
  x: 0,
  y: 0,
};

function CardSwipe<ItemType>({
  data,
  renderItem,
  keyExtractor = defaultKeyExtractor,
  innerRef,
  onChange,
  index,
}: Props<ItemType>) {
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

  const [springProps, api] = useSprings(data.length, () => ({
    ...initialPosition,
    config: { mass: 5, tension: 350, friction: 40 },
  }));
  const [springDirectionProps, springDirectionAPI] = useSprings(
    data.length,
    () => ({
      direction: 0,
      config: { round: 1, bounce: 0 },
    })
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
          if (y < 0) {
            swipeDirection = DIRECTIONS.TOP;
          } else if (y > 0) {
            swipeDirection = DIRECTIONS.BOTTOM;
          }
        } else {
          if (x < 0) {
            swipeDirection = DIRECTIONS.LEFT;
          } else {
            swipeDirection = DIRECTIONS.RIGHT;
          }
        }

        let rotateZ = 0;
        if (!active && trigger) {
          _index.current = cardIndex - 1;
          // gone.add(cardIndex);
          // return;
        }
        const isGone = cardIndex > _index.current;
        // console.log("cardIndex>>>>>>.", isGone, cardIndex, _index.current);
        let _x = x;
        let _y = y;

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

        if (isGone && onChange && swipeDirection) {
          setEnableState(false);
        }

        // reduce the number of loop
        springDirectionAPI.set((i) => {
          if (cardIndex !== i) return {};
          return {
            direction: active ? swipeDirection : DIRECTIONS.NONE,
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
            springProp={springProps[i]}
            springDirectionProp={springDirectionProps[i]}
            renderItem={renderItem}
            index={i}
          />
        );
      })}
    </>
  );
}

export default forwardRef(function <ItemType>(
  props: Props<ItemType>,
  ref: CardSwipeRef
) {
  return <CardSwipe {...props} innerRef={ref} />;
}) as typeof CardSwipe;
