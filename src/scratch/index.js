import React, { useEffect } from "react";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";

const alarmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMA2yBOBbAssgxgBYCWAdmAHRkEAuxAbmAMQAqA8gOIcAyAooqAAOAe1jE6w0gJAAPRAEYAbAFYKADjUAmNcoCcAdmUBmAAyaALJoA0IAJ6JNy-RWUm35o0fnLN+zfPMAX0CbNExcAhJyCkEwUggyKCYAZQBVAGF03mTk6RExCSkkWURzXSMKQ301eUcbewRTc3VPIwNFMt0yxWDQ9Gw8IjJKWPjE1k4efmL88WJJaTkEJVUNbT1DUwtrOwcTXRc3E3l5GqNHRRMgkJAwgcjhiloGSlJhbDQmGVgaZBpKZAAM3+GAAFK4TABKJh3CJDaLPRgUN4fVB5URzBbFJaGeQURzVXS1ZSucxmeqIUwVRQ0-SeS5qcyuXTKXq3fpwqIA-B0RgTLh8dEFeZFUBLbyrLQ6AzGMyWCkIXQmChHY5OZTyNxqEystlvCBwaSwwZcqikRFgIWY0UlBDy3YITS6TQqo5eVyaY6KeRs40PaKjBKkKBWwqLSk1CjnExGcxksxe+QKp0HVpGGkBfTlIy6vrhE2PC3I95YNChkXhhAdNQUcqbbwJpRJh1OmtKRT6MyajqxtS+jkFhE8l4UVDCYQAa1gHHHEHLWLFiDUugO-hMy7lihl+mTujbtK7Jh75j7Nz98O5vMtMwxYexiEUFlrRnrHsTyc0igo7cUakUOeUSwO1zdl839a8hFvCt72WNQFXkZwVyQ5CUKMYJgiAA */
  createMachine(
    {
      context: { count: 0 },
      id: "alarmMachine",
      initial: "inactive",
      states: {
        inactive: {
          on: {
            TOGGLE: {
              actions: "incrementCount",
              cond: "lessThanFive",
              target: "pending",
            },
          },
        },
        pending: {
          on: {
            SUCCESS: {
              target: "active",
            },
            TOGGLE: {
              target: "inactive",
            },
          },
        },
        active: {
          initial: "normal",
          states: {
            normal: {
              after: {
                500: {
                  target: "looksGood",
                },
              },
            },
            looksGood: {},
          },
          on: {
            TOGGLE: {
              target: "inactive",
            },
          },
        },
      },
    },
    {
      actions: {
        incrementCount: assign({
          count: (context, event) => context.count + 1,
        }),
      },
      guards: {
        lessThanFive: (context, event) => context.count < 5,
      },
    }
  );

// inspect({
//   iframe: false,
// });

// Create an alarm reducer finite state machine
/*
const alarmReducer = (state, event) => {
  const nextState = alarmMachine.transition(state, event);
  return nextState;

  /* const nextState = alarmMachine.states[state].on[event.type] || state;
  return nextState; * /

  /* switch (state) {
    case "inactive":
      if (event.type === "TOGGLE") return "pending";
      return state;
    case "pending":
      if (event.type === "SUCCESS") return "active";
      else if (event.type === "TOGGLE") return "inactive";
      return state;
    case "active":
      if (event.type === "TOGGLE") return "inactive";
      return state;
    default:
      return state;
  } // * /
};
*/

export const ScratchApp = () => {
  const [state, send] = useMachine(alarmMachine, {
    actions: {
      incrementCount: assign({
        count: (context, event) => {
          console.log(context.count);
          return context.count + 1;
        },
      }),
    },
    devTools: true,
  });

  const status = state.value; // "inactive" | "pending" | "active"
  const { count } = state.context;

  useEffect(() => {
    let timeout;
    if (status === "pending") {
      timeout = setTimeout(() => {
        send({ type: "SUCCESS" });
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [status, send]);

  return (
    <div className="scratch">
      <div className="alarm">
        <div className="alarmTime">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          ({count}) ({state.toStrings().slice(-1)[0]})
        </div>
        <div
          className="alarmToggle"
          data-active={status === "active" || undefined}
          style={{
            opacity: status === "pending" ? 0.5 : 1,
          }}
          onClick={() => send({ type: "TOGGLE" })}
        ></div>
      </div>
    </div>
  );
};
