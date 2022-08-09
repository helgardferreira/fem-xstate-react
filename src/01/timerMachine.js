import { createMachine } from "xstate";

/**
 * Create a "timer" finite state machine with the following states:
 * - idle
 * - running
 * - paused
 */
export const timerMachine = createMachine({
  initial: "idle",
  states: {
    idle: {
      on: {
        TOGGLE: "running",
      },
    },
    running: {
      on: {
        TOGGLE: "paused",
      },
    },
    paused: {
      on: {
        TOGGLE: "running",
        RESET: "idle",
      },
    },
  },
});
