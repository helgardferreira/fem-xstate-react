import { assign, createMachine } from "xstate";

// Actions
const updateTime = assign({
  time: (_, event) => event.time,
});

// Services
const ticker = () => (sendBack) => {
  const interval = setInterval(() => {
    sendBack({
      type: "TICK",
      time: new Date(),
    });
  }, 1000);

  return () => {
    clearInterval(interval);
  };
};

export const clockMachine = createMachine(
  {
    id: "clock",
    initial: "active",
    context: {
      time: new Date(),
    },
    states: {
      active: {
        invoke: {
          id: "interval",
          src: "ticker",
        },
        on: {
          TICK: {
            actions: "updateTime",
          },
        },
      },
    },
  },
  {
    actions: {
      updateTime,
    },
    services: { ticker },
  }
);
