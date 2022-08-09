import { createMachine, assign } from "xstate";

const elapseTime = assign({
  elapsed: (ctx) => ctx.elapsed + ctx.interval,
});
const addMinute = assign({
  duration: (ctx) => ctx.duration + 60,
});
const reset = assign({
  duration: 5,
  elapsed: 0,
});

const timeIsPositive = (ctx, event) =>
  ctx.elapsed + ctx.interval <= ctx.duration;

export const timerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAFQHkBxRgGQFFFQAHAe1lwAuuHvk4gAHogAsUgEwkA7AFYFCgBwAGAJxaFWtQGY1UgDQgAnollSNJKTp0A2A89kBGWboC+Xs2ix4hKQATgCu+PgEUHQAkgDCANJivPxCImKSCEqOUiT6UgYF9nqGWmaWCO5aJG4OWlLqam4ebko+fhg4BMQkYRFRdEysHEggKYLCoqOZMvLKqpo6JUamFohq1XVa1rJKUo7aju0g-l1BveGR+NEAggAidwD6ALIxAHIAqrQj3HwT6dNEAdbFo3DYNAoDAowdC1OVEG4DPJag4Gmomi1ZMdToEelx0KFYJBBsx2Mk-mkpqBMq15FoNI5ZIVrBtQVolPCEEZNqiPIVHMYFFJsZ1caR8YTiQAlNgAZTYtHJqUmGQRSjpDKZcikrNqHLWlRsdjqzlcHm8x3wPAgcDEOO6pHIVCV-ypEisClsiNkekcQt17M5sm0xp06J1qg0GzavhOoodF361xdlNVCEcbjUJAFQpkamhDUznKMbhqdTRGPcIoCCYlRIgKZVgIQciDSNDWhyagztQFwtj9qCjYB1IRcINbgUeS2M-0Rx8XiAA */
  createMachine(
    {
      context: { duration: 5, elapsed: 0, interval: 0.1 },
      initial: "idle",
      states: {
        idle: {
          entry: "reset",
          on: {
            TOGGLE: {
              target: "running",
            },
          },
        },
        running: {
          on: {
            TICK: [
              {
                actions: "elapseTime",
                cond: "timeIsPositive",
              },
              {
                target: "expired",
              },
            ],
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
            RESET: {
              target: "idle",
            },
          },
        },
        expired: {
          on: {
            RESET: {
              target: "idle",
            },
          },
        },
      },
    },
    {
      actions: {
        elapseTime,
        addMinute,
        reset,
      },
      guards: {
        timeIsPositive,
      },
    }
  );
