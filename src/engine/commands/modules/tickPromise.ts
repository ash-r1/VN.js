import * as PIXI from 'pixi.js';

// tick promise
export default function tickPromise(
  ticker: PIXI.Ticker,
  duration: number,
  update: (rate: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let t = 0;
    const tick = (delta: number) => {
      const ms = delta * ticker.deltaMS;
      // この計算そもそも合ってるの？
      t += ms;

      // finalize if duration reaches target duration
      if (t >= duration) {
        ticker.remove(tick);
        update(1.0);
        resolve();
        return;
      }

      update(t / duration);
    };
    ticker.add(tick);

    // TODO: easing func?
  });
}
