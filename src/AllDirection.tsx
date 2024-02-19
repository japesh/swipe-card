import { useState } from "react";
import imgs from "./AllDirection.data";

import styles from "./AllDirectionStyle.module.css";
import CardSwipe from "./CardSwipe";

export default function App() {
  const [] = useState();
  return (
    <div className={styles.container}>
      <CardSwipe
        data={imgs}

        renderItem={({ item: img }) => {
          return (
            <div className={styles.card}>
              <div style={{ backgroundSize: 'contain', backgroundImage: `url(${img})` }} />
            </div>
          );
        }}
      />
    </div>
  );
}
