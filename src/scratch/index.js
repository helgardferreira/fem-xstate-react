import React, { useEffect, useReducer, useState } from "react";
import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";

const initialState = "inactive";

const alarmMachine = {
  initial: "inactive",
  states: {
    inactive: {
      on: { TOGGLE: "pending" },
    },
    pending: {
      on: { SUCCESS: "active", TOGGLE: "inactive" },
    },
    active: {
      on: { TOGGLE: "inactive" },
    },
  },
};

// Create an alarm reducer finite state machine
const alarmReducer = (state, event) => {
  const nextState = alarmMachine
    .states[state]
    .on[event.type] || state;

  return nextState;
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
  } */
};

export const ScratchApp = () => {
  const [status, dispatch] = useReducer(alarmReducer, initialState);

  useEffect(() => {
    let timeout;
    if (status === "pending") {
      timeout = setTimeout(() => {
        dispatch({ type: "SUCCESS" });
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [status, dispatch]);

  return (
    <div className="scratch">
      <div className="alarm">
        <div className="alarmTime">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div
          className="alarmToggle"
          data-active={status === "active" || undefined}
          style={{
            opacity: status === "pending" ? 0.5 : 1,
          }}
          onClick={() => dispatch({ type: "TOGGLE" })}
        ></div>
      </div>
    </div>
  );
};
