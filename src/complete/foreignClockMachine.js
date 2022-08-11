import { assign, createMachine } from "xstate";

// Actions
const loadTimezones = assign({
  timezones: (_, e) => e.data,
});
const updateForeignTimezone = assign({
  foreignTime: (ctx, event) => {
    return new Date(event.time);
  },
});
const changeTimezone = assign((ctx, e) => ({
  timezone: e.value,
  foreignTime: new Date(),
}));

export const foreignClockMachine = createMachine(
  {
    initial: "loadingTimezones",
    context: {
      timezones: null,
      timezone: null,
      foreignTime: null,
    },
    states: {
      loadingTimezones: {
        on: {
          "TIMEZONES.LOADED": {
            target: "time",
            actions: "loadTimezones",
          },
        },
      },
      time: {
        initial: "noTimezoneSelected",
        states: {
          noTimezoneSelected: {},
          timezoneSelected: {
            on: {
              "LOCAL.UPDATE": {
                actions: "updateForeignTimezone",
              },
            },
          },
        },
        on: {
          "TIMEZONE.CHANGE": {
            target: ".timezoneSelected",
            actions: "changeTimezone",
          },
        },
      },
    },
  },
  { actions: { loadTimezones, updateForeignTimezone, changeTimezone } }
);
