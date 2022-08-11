import { createMachine, assign } from "xstate";

// Actions
const resetTimer = assign({
  duration: 5,
  elapsed: 0,
});
const elapseTime = assign({
  elapsed: (ctx) => ctx.elapsed + ctx.interval,
});
const addMinute = assign({
  duration: (ctx) => ctx.duration + 60,
});

// Services
// N.B. the context value that the service has access to is the context when
// the service is invoked. If you need an updated context you will need
// to use the send function to send an event to the service callback - remember
// the ID!
const ticker = (context, event) => (send) => {
  const interval = setInterval(() => {
    send({ type: "TICK" });
  }, 1000 * context.interval);

  return () => clearInterval(interval);
};

const timerExpired = (ctx) => ctx.elapsed >= ctx.duration;

export const timerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWBbMAnAdKiANmAMQAqA8gOKUAyAooqAA4D2sqaLAdoyAB6IAzAFYATDgCMADgDswgAyiZAFhkz5MwQBoQAT0RKAnDkFSAbGamCzwmVPlnRZgL7OdaTLnxFiAJToAynSkvKzsnDxI-AaixsKGgnJSooKiyhJmhjI6+ggShsIm5pmiwhISwlLCYq7uGNg4WACuXFyoXFA4XCxY6ACGBH6BwaFsHKjcvAIICjI4yqLS1jJOiaKlOUKGUjiK8vuG8sKCghLKwsq1IB4Nza3tnd29A8Sj4RORoNNmDjiayqc1MpDFk5JsEAsJDgxPsUokzIJDBZLm5rvVcHc2h0cCwAG7YG5kKi0BhRMLjSZRabJKFVC4yH6LQTKKSGcHKX5VVKssrqC6GK43DEtLFQMgASQAwgBpN4Uz7RBBmGRxFLKZWWI6I7J6RASNS7UT7CQicxSWSaQXoxoih5E6j0OURKZ6sQ4Q6OFmGNJlZlScHWQorY3KYFmfLHK2eG33DrEACCABFEwB9ACy4oAcgBVUik5hjZ1UxDKwqOcryLI-OyWcGHQ37I4m4HSeRSKMNJh9JqwSD2klOj4uvJuj1pVk+5v+3UQk1-I0HIH6rIouqeIZBEJkwtD4sQ0TgpziLUiceyQT7GSuVHdCBwXhCvCEMCDylfPUAkzydV0jL2GQSIeLJFBYFo8pk3odsKsaPD0-QEK+CrTAoyjzGcRzAss+zTrk5xQns+wAqcsSsquaLRpiDw4viWA3Ihw7JPIuwJJoRz2NI8TsvEOBcicSIIhclTCFBMaivRe4skx6QcvyWFtgGTi7PkIJ8tsJxnCJXY9pA4nvvuAbKiByqSRyShHFBumKtI4JmA2jb2Y2+rXs4QA */
  createMachine(
    {
      context: { duration: 60, elapsed: 0, interval: 0.1 },
      id: "timer",
      initial: "idle",
      states: {
        idle: {
          entry: "resetTimer",
          on: {
            TOGGLE: {
              target: "running",
            },
            RESET: {},
          },
        },
        running: {
          invoke: {
            src: "ticker",
          },
          initial: "normal",
          states: {
            normal: {
              always: {
                cond: "timerExpired",
                target: "overtime",
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
            TOGGLE: {
              target: "paused",
            },
            ADD_MINUTE: {
              actions: "addMinute",
            },
          },
        },
        paused: {
          on: {
            TOGGLE: {
              target: "running",
            },
          },
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
        resetTimer,
        elapseTime,
        addMinute,
      },
      guards: { timerExpired },
      services: {
        ticker,
      },
    }
  );
