import React, { useRef, useEffect, useState } from "react";
import { useSpring, animated, to, useSprings } from "@react-spring/web";
import { useGesture } from "react-use-gesture";
import imgs from "./AllDirection.data";

import styles from "./AllDirectionStyle.module.css";

const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;

// const wheel = (y: number) => {
//   const imgHeight = window.innerWidth * 0.3 - 20;
//   return `translateY(${-imgHeight * (y < 0 ? 6 : 1) - (y % (imgHeight * 5))}px`;
// };

enum DIRECTIONS {
  TOP = "TOP",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  BOTTOM = "BOTTOM",
}

// const cardIndex = 0;

export default function App() {
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
  const [springProps, api] = useSprings(imgs.length, () => ({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    zoom: 0,
    x: 0,
    y: 0,
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  // const [wheelProps, wheelApi] = useSprings(imgs.length, () => ({ wheelY: 0 }));

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

        console.log("movement", swipeDirection, trigger);
        // console.log("direction",xDir, yDir);
        // console.log("offset", offset);
        let rotateZ = 0;
        if (!down && trigger) {
          gone.add(cardIndex);
          // return;
        }
        const isGone = gone.has(cardIndex);
        console.log("isGone");
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
            x: down || isGone ? _x : 0,
            y: down || isGone ? _y : 0,
            rotateX: 0,
            rotateY: 0,
            scale: active ? 1 : 1.1,
            rotateZ: down ? rotateZ : 0,

            config: {
              mass: 5,
              tension: down ? 800 : isGone ? 200 : 350,
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
      // onWheel: ({ event, offset: [, y], args: [cardIndex] }) => {
      //   event.preventDefault();
      //   console.log("onWheel>>>>>>>>>")
      //   wheelApi.set({
      //     wheelY: y,
      //   });
      // },
    },
    { eventOptions: { passive: false } }
  );
  return (
    <div className={styles.container}>
      {imgs.map((img, i) => {
        const { x, y, rotateX, rotateY, rotateZ, zoom, scale } = springProps[i];
        // const { wheelY } = wheelProps[i];
        return (
          <animated.div
            key={img}
            {...bind(i)}
            ref={domTarget}
            className={styles.card}
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
            {/* <animated.div style={{ transform: wheelY.to(wheel) }}> */}
            <animated.div>
              <div style={{ backgroundImage: `url(${img})` }} />
            </animated.div>
          </animated.div>
        );
      })}
    </div>
  );
}
