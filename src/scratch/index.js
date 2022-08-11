import React from "react";
import { createMachine, assign, send, spawn, sendParent } from "xstate";
import { useMachine, useService } from "@xstate/react";

const saveAlarm = async () => {
  return new Promise((res) => {
    setTimeout(() => {
      res(100);
    }, 2000);
  });
};

const alarmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMA2yBOBbAssgxgBYCWAdmAHRkEAuxAbmAMQAqA8gOIcAyAooqAAOAe1jE6w0gJAAPRAEYAbAFYKADjUAmNfIAsmxdoAMegDQgAnok3KA7BV0BOZ46NrnGgL6fzaTLgIScgpBMFIIMigmCElKMnphAGtKP2w8IjJKUPDIhHjhfGQJUgBtIwBdaRExYuk5BEVdRQpNWwBmXTbbTSNlZW01cysEPU11Non9RUUjJsU1ZW9fdDTAzJCwiNIosAwMYQwQ9BoAMwOsClSAjODsrag80gTC4rLKpBBq8WJJOsRG5qtDpdHp9AZDRBteRjNQTNqteZqRqOAxLEBXdJBLKbSKsTg8fgfL61D71Ay6ChGRxdZSKFFGFTzRQQhA9RwOFyOPQLIytPpojFrYK0BjMdhcPhVUTfX6kxC2WyqNSdWyOfSOdrKNS2FnuCicrkK2wzeQdbw+ECkYQQODSQU3OKkEWMKU1H5SOUIfQszRc-UuWG6ZVaumLC32rEbHLbV0yj2geptHQUeFGVMLI2wn0qFNwzTyXnTXS6eS2AUra6R51gWMkhOIdxtSm2NOmrXQ+aOFnyP1KabKLm9NyKRXl-yY9YYMAAKzA+BokFr7r+CEbzdbbXbBncLLaRnscNTwI1mjHqwdS9l9ZGg0sCjU5s8QA */
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
          invoke: {
            id: "timeout",
            // invoking service instead of actor
            /* src: "saveAlarmService", */
            src: (ctx, e) => (sendBack, receive) => {
              console.log("invoking service");
              // actor can choose whether to send or not based off of event
              receive((event) => {
                console.log(event);
              });

              const timeout = setTimeout(() => {
                sendBack({
                  type: "SUCCESS",
                });
              }, 2000);

              return () => {
                console.log("cleaning up!");
                clearTimeout(timeout);
              };
            },
            // Using services example instead of actor
            /* onDone: [
              {
                cond: (ctx, event) => {
                  return event.data > 99;
                },
                target: "active",
              },
              {
                target: "rejected",
              },
            ],
            onError: [
              {
                target: "rejected",
              },
            ], */
          },
          on: {
            SUCCESS: { target: "active" },
            TOGGLE: {
              target: "inactive",
              // Sending a message to a callback actor
              /* actions: send(
                { type: "GOODBYE" },
                {
                  to: "timeout",
                }
              ), */
            },
          },
        },
        active: {
          // Nested states example
          /* initial: "normal",
          states: {
            normal: {
              after: {
                500: {
                  target: "looksGood",
                },
              },
            },
            looksGood: {},
          }, */
          entry: sendParent({ type: "ACTIVE" }),
          on: {
            TOGGLE: {
              target: "inactive",
            },
          },
        },
        rejected: {},
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
      services: {
        /* saveAlarmService: (ctx, event) => {
          return saveAlarm();
        }, */
      },
    }
  );

const alarmsMachine = createMachine({
  id: "alarms",
  initial: "active",
  context: {
    alarms: [],
  },
  states: {
    active: {
      on: {
        ADD_ALARM: {
          actions: assign({
            alarms: (context, event) => {
              const alarm = spawn(alarmMachine);

              return context.alarms.concat(alarm);
            },
          }),
        },
        ACTIVE: {
          actions: (context, event) => {
            console.log("received event");
          },
        },
      },
    },
  },
});

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

const Alarm = ({ alarmRef }) => {
  const [state, sendAlarm] = useService(alarmRef);

  const status = state.value; // "inactive" | "pending" | "active"
  const { count } = state.context;

  return (
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
        onClick={() => sendAlarm({ type: "TOGGLE" })}
      ></div>
    </div>
  );
};

export const ScratchApp = () => {
  const [state, sendAlarms] = useMachine(alarmsMachine, { devTools: true });

  const { alarms } = state.context;

  return (
    <div className="scratch">
      <button onClick={() => sendAlarms({ type: "ADD_ALARM" })}>
        Add Alarm
      </button>
      {alarms.map((alarm) => {
        return <Alarm key={alarm.id} alarmRef={alarm} />;
      })}
    </div>
  );
};
