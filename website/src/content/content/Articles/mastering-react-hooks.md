---
type: page
title: Mastering React Hooks
description: Deep dive into React Hooks including useState, useEffect, useContext, and custom hooks
tags: [react, hooks, frontend, javascript, web-development]
created: 2024-09-10
status: published
---

*Published: September 2024 | Reading time: 7 min*

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Why Hooks?

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

### Problems with Class Components

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum:

- Complex lifecycle methods
- Code duplication
- Difficult to reuse stateful logic
- Confusing `this` binding

## Basic Hooks

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

### useState

```javascript
import { useState } from 'react';

function Counter() {
  // Lorem ipsum dolor sit amet
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Lorem ipsum: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Dolor sit amet
      </button>
    </div>
  );
}
```

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### useEffect

```javascript
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lorem ipsum dolor sit amet
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    }

    fetchUser();

    // Cleanup - consectetur adipiscing
    return () => {
      // Sed do eiusmod cleanup
    };
  }, [userId]);

  // Ut labore et dolore
  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}
```

Ut enim ad minim veniam, quis nostrud exercitation.

### useContext

Lorem ipsum dolor sit amet, consectetur adipiscing elit:

```javascript
import { createContext, useContext } from 'react';

// Lorem ipsum context
const ThemeContext = createContext('light');

function ThemedButton() {
  // Consectetur adipiscing elit
  const theme = useContext(ThemeContext);

  return (
    <button className={theme}>
      Lorem ipsum
    </button>
  );
}
```

## Advanced Hooks

Duis aute irure dolor in reprehenderit in voluptate velit.

### useReducer

```javascript
import { useReducer } from 'react';

// Lorem ipsum reducer
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <>
      <p>Consectetur: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        Adipiscing
      </button>
    </>
  );
}
```

### useMemo

Excepteur sint occaecat cupidatat non proident:

```javascript
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  // Lorem ipsum dolor sit amet
  const processedData = useMemo(() => {
    return data.map(item => {
      // Consectetur adipiscing elit
      return item.value * 2;
    });
  }, [data]);

  return <div>{processedData.length}</div>;
}
```

### useCallback

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Custom Hooks

Sed do eiusmod tempor incididunt ut labore et dolore:

```javascript
// Lorem ipsum custom hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Consectetur adipiscing usage
function App() {
  const [name, setName] = useLocalStorage('name', 'Lorem');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

## Best Practices

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris:

1. **Rules of Hooks**: Lorem ipsum dolor sit amet
2. **Dependency Arrays**: Consectetur adipiscing elit
3. **Custom Hook Naming**: Sed do eiusmod tempor
4. **Effect Cleanup**: Ut labore et dolore magna

### Common Pitfalls

Duis aute irure dolor in reprehenderit in voluptate velit:

- Missing dependencies
- Infinite loops
- Stale closures
- Unnecessary re-renders

## Performance Optimization

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.

### When to Use useMemo and useCallback

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.

## Conclusion

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.

---

*Tags: #react #hooks #frontend #javascript #web-development*
