import { createMachine, assign } from "xstate";

const reset = assign({
  duration: 5,
  elapsed: 0,
});
const elapseTime = assign({
  elapsed: (ctx) => ctx.elapsed + ctx.interval,
});
const addMinute = assign({
  duration: (ctx) => ctx.duration + 60,
});
const timerExpired = (ctx) => ctx.elapsed >= ctx.duration;

export const timerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWBbMAnAsgQwGMALVAOzADpUIAbMAYgBUB5AcVYBkBRRUABwD2sVGgGleIAB6IALHIoBmAJwAOGQEYNAVi0qA7ADYtAGhABPRACYADEopbrj9Yb3WbM3QF9PptJlyEJOQUWACupKRkUEwAkgDCANISgsKi4khSVqqKMkpK1gYq+gVqeqYWCArySurqylpKBvkKCpYG3r4Y2PjEZJRhEVFMbJw8GSkiqGIS0ggalvZ1LQpa6tZ66qsy5VZqFJauKgatm0p6lkodIH7dgX0h4ZGk0QCCACJvAPo4MQByAKqMMb8ISTaYZWZGdQUJRaSy6PQqRr5Nw7BCbBQUJEyeHrAz4gwFBRXG4BXrBAZPaLJUFpGaIPStCjWfTqWHHLQKayaNEKZyKaw6XJqVr6do+a5dMlBSh8PChWCQYbsbg01JTdKgWabBb5AyWdSWZSOI1tNEyQmKZYGGQrdZaAx6ElSnoyihyhVKgBKXAAylxGGqwZrMui4TCCgajSjTQY0WzocsqjIkYz3DJnf5XfcwJI+KgsN6-QGg3SIYg1NCU4KVmsWQ0lGj8szHNyjCscSzvBLSAIIHAJKTs8FqHRSxr6QgDtYKHUDlDjlzVvHLUmDhsqqs9FpM7dyf1HlFx+CtYhdDJFKpbYVVjoDebVvZlnpVCo1ioWrvpfcPYqIMeQ1mHFeRWK0WkMKpXBxDMJSHO5glzfNC3-cZaQncsECUI0YTyM4jm5SxLHNeQFAJY5nF0HRxU6LN4LAADJ3UFR4xUFtHBkNs2VaS5uyAA */
  createMachine(
    {
      context: { duration: 5, elapsed: 0, interval: 0.1 },
      id: "timerMachine",
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
          always: {
            cond: "timerExpired",
            target: "expired",
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
        reset,
        elapseTime,
        addMinute,
      },
      guards: {
        timerExpired,
      },
    }
  );
