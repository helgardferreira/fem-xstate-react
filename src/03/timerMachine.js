import { createMachine, assign } from "xstate";

const tick = assign({
  elapsed: (context, event) => context.elapsed + context.interval,
});
const addMinute = assign({
  duration: 60,
  elapsed: 0,
});
const reset = assign({
  duration: (ctx) => ctx.duration + 60,
});

export const timerMachine = createMachine(
  {
    initial: "idle",
    context: {
      duration: 60,
      elapsed: 0,
      interval: 0.1,
    },
    states: {
      idle: {
        // Parameterize this action:
        entry: "addMinute",

        on: {
          TOGGLE: "running",
        },
      },
      running: {
        on: {
          TICK: {
            actions: "tick",
          },

          TOGGLE: "paused",
          ADD_MINUTE: {
            // Parameterize this action:
            actions: "reset",
          },
        },
      },
      paused: {
        on: {
          TOGGLE: "running",
          RESET: "idle",
        },
      },
    },
  },
  {
    actions: {
      tick,
      addMinute,
      reset,
    },
  }
);
