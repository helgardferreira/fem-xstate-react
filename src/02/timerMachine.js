import { createMachine, assign } from "xstate";

export const timerMachine = createMachine({
  initial: "idle",
  context: {
    duration: 60,
    elapsed: 0,
    interval: 0.1,
  },
  states: {
    idle: {
      // Reset duration and elapsed on entry
      entry: assign({
        elapsed: 0,
        duration: 60,
      }),
      on: {
        TOGGLE: {
          target: "running",
        },
      },
    },
    running: {
      on: {
        TOGGLE: {
          target: "paused",
        },
        ADD_MINUTE: {
          actions: assign({
            duration: (context, event) => {
              console.log("ADD_MINUTE");
              return context.duration + 60;
            },
          }),
        },
      },
    },
    paused: {
      on: {
        TOGGLE: "running",
        RESET: {
          target: "idle",
        },
      },
    },
  },
});
