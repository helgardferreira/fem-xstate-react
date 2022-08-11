import { createMachine, assign } from "xstate";

const ticker = (ctx) => (sendBack) => {
  const interval = setInterval(() => {
    sendBack("TICK");
  }, ctx.interval * 1000);

  return () => clearInterval(interval);
};
const elapseTime = assign({
  elapsed: (ctx) => ctx.elapsed + ctx.interval,
});
const addMinute = assign({
  duration: (ctx) => ctx.duration + 60,
});
const timerExpired = (ctx) => ctx.elapsed >= ctx.duration;

export const createTimerMachine = (duration) =>
  createMachine(
    {
      id: "timer",
      initial: "running",
      context: {
        duration,
        elapsed: 0,
        interval: 0.1,
      },
      states: {
        idle: {
          entry: "resetTimer",
          on: {
            TOGGLE: "running",
            RESET: {},
          },
        },
        running: {
          invoke: {
            id: "ticker", // only used for viz
            src: "ticker",
          },
          initial: "normal",
          states: {
            normal: {
              always: {
                target: "overtime",
                cond: "timerExpired",
              },
              on: {
                RESET: {},
              },
            },
            overtime: {
              on: {
                TOGGLE: {},
              },
            },
          },
          on: {
            TICK: {
              actions: "elapseTime",
            },
            TOGGLE: "paused",
            ADD_MINUTE: {
              actions: "addMinute",
            },
          },
        },
        paused: {
          on: { TOGGLE: "running" },
        },
      },
      on: {
        RESET: {
          target: ".idle",
        },
      },
    },
    {
      actions: {
        elapseTime,
        addMinute,
        resetTimer: assign({
          duration,
          elapsed: 0,
        }),
      },
      guards: {
        timerExpired,
      },
      services: {
        ticker,
      },
    }
  );
