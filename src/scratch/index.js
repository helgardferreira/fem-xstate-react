import React, { useEffect } from "react";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
// import { inspect } from "@xstate/inspect";

const alarmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgKwBdcA3MAYgBUB5AcRYBkBRRUABwHtYuKv3w8QAD0QBGAGwBWEgA4lAJiUBmAOzyALAAZ9s3dIA0IAJ6JV8rSXmH9c3Rpu7V++QF8v5tFjxCUl4wfAgCKDoAZQBVAGE4ziio8QEhETEkSURdBxJ9LX1VAE5DWTUdYvMrBFVpYpI5WVli4xVyrV0lHz8MHAJiEhCwiMZWDm4stOFcUXEpWo8SA1lVLRL5DQ1iuurrfQaHQy3jHSVZaVUekH9+oJJKGnpmNi5UwRm5rIXcpXzVDS6IFKfRbeSqPYIUr5RzuGzyaT6JTSLQ+XwgfD8CBwcS3QKDciYKi0d7pWaZUA-CGWRCteyObYaJTyYqAuTXPEDYKhcL4KCkz4U7IILZ2WSuEGyLQXBTUmp1DQkZrNYqs2znaS6WQcvr40iPElTD4ZeaIWyKVS6VVaDVyaTSJSQ4q6RrNQpaVqbTTedGcoICk3fGSOmkIB0w45aS7O6W5DRorxAA */
  createMachine(
    {
      context: { count: 0 },
      id: "(machine)",
      initial: "inactive",
      states: {
        inactive: {
          on: {
            TOGGLE: {
              actions: "incrementCount",
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
    devTools: true
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
          ({count})
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
