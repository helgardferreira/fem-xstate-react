import { createMachine, assign } from "xstate";

const timerExpired = (ctx) => ctx.elapsed >= ctx.duration;

export const timerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWBbMAnAdKiANmAMQAqA8gOKUAyAooqAA4D2sqaLAdoyAB6IAzACYADDgCcwiQFYJEgOwSALKICMEtQoA0IAJ6I1giTjUA2CzOVqAHGdE2bM4QF8XutJlxYArly6oXFA4XCxY6ACGBMQASnQAynSkvKzsnDxI-IhOOKKiCjaqCqKywma6BghmCgqS8oqiMg7CLRJuHhjYOL7+gcGh4VHEKWwcqNy8Agi2yjgiooKLzjaaEoI2FYjFajjK9cbyombKygrtIJ5dPQFBOCwAbtiXZFS0DJmpYxOZUwe71jI1EYVHIzDZBJsqnYcODFupRGJ7IIzOdLt4-Ddgg8np1iHxYMgIsgwDgIgAzYlYAAU9jyAEpiGjuhi+ndHlhLiM0uMMqApoDBLtpDYtDVqsJIQplDI5othAUNGYZCIZKjOujekFiBBuCSCUSSUzrn0uV9eVkEPNJNI5IoVOpNDp9IhNKYLEqHM5hIIrK53Bd1czNVAyABJADCAGlTelJogTjtnD78gpqsjTpCmrV6hIzFpHJplDY1V4g5iXtR6DGeXGEHZxKmZAphDJlnsypLlMIYXKzC3lUcbH6OqXjVqAIIAEUnAH0ALKhgByAFVSO9mKNYz94xo5gomlZHAsDzJIV2dnlLwiZMcmsOA6WmBEfLBIBW3tXvnzsvYcI3m62wiFFI5TOlUfZuhY5hqNKDRqCW2CxAkSSfuaUxdpCahiHU8grLhJwOPB5yhBAcC8Ey+BEKhtYwYKgiiMoSrCGoJR2FKkISOIV5qAKjRmMYqr+kaLK3AMkQENR251hKYEKPROEqPmTa5soCEapibI4pgknfpaig4NUih9usgiMRIkrGD2IjNsKor3sJwY4Jc5DsjpFrVDsWGAmI6g2AoLGnrJlmLCqhR7HYJxqWWJofJuNZSTIGxgfYMo5n5yiLGsThRU+L6QG5UyKNmUhAUB8hFkoFniOYSpDlhPrNkRI7YAVhhJZUKJuC4QA */
  createMachine(
    {
      context: { duration: 5, elapsed: 0, interval: 0.1 },
      id: "timer",
      initial: "idle",
      states: {
        idle: {
          entry: assign({
            duration: 5,
            elapsed: 0,
          }),
          on: {
            TOGGLE: {
              target: "running",
            },
          },
        },
        running: {
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
              after: {
                6000: {
                  target: "timeOver",
                },
              },
              on: {
                TOGGLE: {},
              },
            },
            timeOver: {
              type: "final",
            },
          },
          on: {
            TICK: {
              actions: assign({
                elapsed: (ctx) => ctx.elapsed + ctx.interval,
              }),
            },
            TOGGLE: {
              target: "paused",
            },
            ADD_MINUTE: {
              actions: assign({
                duration: (ctx) => ctx.duration + 60,
              }),
            },
          },
          onDone: {
            target: "idle",
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
      guards: {
        timerExpired,
      },
    }
  );
