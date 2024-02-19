import { animated, to, useSprings } from "@react-spring/web";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useGesture } from "react-use-gesture";

const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;

enum DIRECTIONS {
  TOP = "TOP",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  BOTTOM = "BOTTOM",
}

type Props<ItemType> = {
  data: ItemType[];
  renderItem: (args: { item: ItemType }) => ReactElement;
};

function useValue<valueType>({
  value,
  onChange,
  formatValue = (value) => value,
  unFormatValue = (value) => value,
  isValid = () => true,
  isFormattedPartially = () => false,
}: {
  value?: valueType;
  onChange?: (value: valueType) => void;
  formatValue?: (value: valueType) => valueType;
  unFormatValue?: (value: valueType) => valueType;
  isValid?: (value: valueType) => boolean;
  isFormattedPartially?: (value: valueType) => boolean;
}) {
  const localValueRef = useRef(value);

  const [formattedValue, setFormattedValue] = useState(() => {
    if (value !== undefined) {
      return formatValue(value);
    }
  });

  const onChangeValue = useCallback(
    (newValue: valueType) => {
      // for use cases like date/currency where it's not completed with / and dot as an end character in string
      if (isFormattedPartially(newValue)) {
        setFormattedValue(newValue);
        return;
      }

      const _newUnformattedValue = unFormatValue(newValue);
      if (!isValid(_newUnformattedValue)) {
        return;
      }

      const _formattedValue = formatValue(_newUnformattedValue);
      localValueRef.current = _newUnformattedValue;

      if (onChange) {
        onChange(_newUnformattedValue);
      }
      setFormattedValue(_formattedValue);
    },
    [onChange]
  );

  useEffect(() => {
    if (value !== localValueRef.current) {
      // @ts-ignore
      setFormattedValue(formatValue(value));
      localValueRef.current = value;
    }
  }, [value]);
}

export default function CardSwipe<ItemType>({
  data,
  renderItem,
}: Props<ItemType>) {
  const [gone] = useState(() => new Set());

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, []);

  const domTarget = useRef(null);
  const [springProps, api] = useSprings(data.length, () => ({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    zoom: 0,
    x: 0,
    y: 0,
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  const bind = useGesture(
    {
      onDrag: ({
        active,
        down,
        movement: [x, y],
        velocity,
        args: [cardIndex],
      }) => {
        // trigger can consider if card is near edges or not
        const trigger = velocity > 0.2;
        let swipeDirection;
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
          gone.add(cardIndex);
          // return;
        }
        const isGone = gone.has(cardIndex);
        console.log("isGone",active, down, isGone, window.innerWidth);
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

        api.start((i) => {
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
            },
          };
        });
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
    { eventOptions: { passive: false } }
  );
  return (
    <>
      {data.map((item, i) => {
        const { x, y, rotateX, rotateY, rotateZ, zoom, scale } = springProps[i];
        // const { wheelY } = wheelProps[i];
        return (
          <animated.div
            key={i}
            {...bind(i)}
            ref={domTarget}
            // className={styles.card}
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
            {renderItem({ item })}
          </animated.div>
        );
      })}
    </>
  );
}
