React 

const [name, setName] = useState(""); 
onChange={(e) => setName(e.target.value)}

----------------------------------------

const [user, setUser] = useState({
    name: 'tito',
    age: 22,
    sex: female
});

// wrong👎
user.name = 'esther';

// right👍
setUser({...user, name: 'esther'})

---------------------------------------------

const [names, setNames] = useState([]);

// wrong👎
names.push('john');

// right👍
setNames([...names, 'john'])  // adds 'john' to end of list
setNames(['john', ...names])  // adds 'john' to beginning of list
setNames(names.filter(name => name.startsWith('e')) ); // deletes 'esther'

------------------------------------------------------------------

State can be passed as props from a parent to a child component. 

============================== Props ============================================

function App() {
  return (
    <User name="Akshay" age={28} />
  );
}

function Button({ onClick }) {
  return <button onClick={onClick}>Click</button>;
}

function User(props) { //User({name, age})
  return (
    <div>
      <h2>Name: {props.name}</h2>
      <p>Age: {props.age}</p>
    </div>
  );
}

--------------------------

function App() {
  const handleClick = () => {
    alert("Button clicked");
  };

  return <Button onClick={handleClick} />;
}

function Button({ onClick }) {
  return <button onClick={onClick}>Click</button>;
}





============ USE EFFECT ===========

useEffect(() => {
  //Runs on every render
});

useEffect(() => {
  //Runs only on the first render
}, []);

useEffect(() => {
  //Runs on the first render
  //And any time any dependency value changes
}, [prop, state]);


============= Use Context ================

Used to share state in hirarchy without prop drilling

import { createContext } from "react";
export const ThemeContext = createContext();
------

import { ThemeContext } from "./ThemeContext";
function App() {
  const theme = "dark";
  return (
    <ThemeContext.Provider value={theme}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}

import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
function Dashboard() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Dashboard</div>;
}

============= USE REF =====================

useRef returns a mutable object whose .current property persists for the full lifetime of the component. Updating it does NOT trigger a re-render.

const ref = useRef(initialValue); ref.current // mutable value

Focus Input on button click

import { useRef } from "react";
function FocusInput() {
  const inputRef = useRef(null);
  const focusInput = () => {
    inputRef.current.focus();
  };
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}

Persisting Values Without Re-render

import { useEffect, useRef } from "react";
function RenderCounter() {
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
  });
  return <h2>Rendered {renderCount.current} times</h2>;
}

======================= useReducer ==============================

useReducer is an alternative to useState for state management when state transitions depend on previous state or involve complex logic.

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "RESET":
      return { count: 0 };
    default:
      return state;
  }
}

import { useReducer } from "react";
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <h2>Count: {state.count}</h2>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
      <button onClick={() => dispatch({ type: "RESET" })}>Reset</button>
    </>
  );
}

====================== Use Callback ====================================

useCallback returns a memoized version of a callback function that only changes when its dependencies change.

import { useCallback, useState } from "react";
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    console.log("Button clicked");
  }, []);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={handleClick} />
    </>
  );
}
✔ handleClick reference stays same
✔ Child does NOT re-render unnecessarily

useCallback is used to memoize functions to prevent unnecessary re-renders caused by changing function references.

=========================== Use Memo ==================================

useMemo returns a cached (memoized) value and recomputes it only when the dependency array changes.
const memoizedValue = useMemo(() => computeValue(), [dependencies]);

import { useMemo, useState } from "react";
const expensiveCalculation = (num) => {
  console.log("Calculating...");
  return num * 1000000;
};
function Example() {
  const [number, setNumber] = useState(1);
  const [count, setCount] = useState(0);
  const result = useMemo(() => {
    return expensiveCalculation(number);
  }, [number]);
  return (
    <>
      <h2>Result: {result}</h2>
      <button onClick={() => setCount(count + 1)}>Re-render</button>
      <button onClick={() => setNumber(number + 1)}>Change Number</button>
    </>
  );
}
✔ expensiveCalculation runs only when number changes
✔ Button updating count does not trigger recalculation

const sortedData = useMemo(() => sortData(data), [data]);

Real-World Use Cases 
1️⃣ Expensive Calculations

Sorting, Filtering, Aggregations











