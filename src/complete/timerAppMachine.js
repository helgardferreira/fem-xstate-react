import { createMachine, assign, spawn } from "xstate";
import { createTimerMachine } from "./timerMachine";

const deleteTimer = assign((ctx, e) => {
  const timers = ctx.timers.filter((_, i) => i !== e.index);
  const currentTimer = timers.length - 1;

  return {
    timers,
    currentTimer,
  };
});

const timersExist = (ctx) => ctx.timers.length > 0;
const noTimersExist = (ctx) => ctx.timers.length === 0;

const switchCurrentTimer = assign({
  currentTimer: (_, event) => event.index,
});
const createTimer = assign((ctx, event) => {
  const newTimer = spawn(createTimerMachine(event.duration));

  const timers = ctx.timers.concat(newTimer);

  return {
    timers,
    currentTimer: timers.length - 1,
  };
});

export const timerAppMachine = createMachine(
  {
    initial: "new",
    context: {
      duration: 0,
      currentTimer: -1,
      timers: [],
    },
    states: {
      new: {
        on: {
          CANCEL: {
            target: "timer",
            cond: "timersExist",
          },
        },
      },
      timer: {
        on: {
          DELETE: {
            actions: "deleteTimer",
            target: "deleting",
          },
        },
      },
      deleting: {
        always: [{ target: "new", cond: "noTimersExist" }, { target: "timer" }],
      },
    },
    on: {
      ADD: {
        target: ".timer",
        actions: "createTimer",
      },
      CREATE: "new",
      SWITCH: {
        actions: "switchCurrentTimer",
      },
    },
  },
  {
    actions: { deleteTimer, createTimer, switchCurrentTimer },
    guards: { timersExist, noTimersExist },
  }
);
