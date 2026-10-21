# React State & Hooks Reference

Comprehensive reference guide covering component lifecycle standards, traditional hooks (`useState`, `useMemo`, `useCallback`, `useEffect`), and modern React (React 18 & 19) hooks for asynchronous transitions, optimistic UI, and form actions.

---

## 1. Structure of `.tsx` Components

Maintain a strict, role-ordered declaration pipeline inside component files:

$$\text{Constants} \rightarrow \text{State \& Hooks} \rightarrow \text{Memos (useMemo)} \rightarrow \text{Effects (useEffect)} \rightarrow \text{Callbacks (useCallback)} \rightarrow \text{JSX Return}$$

1. **Imports**: Third-party (React/Next/Antd) $\rightarrow$ Shared internal (`@/components`, `@/hooks`) $\rightarrow$ Local page files (`./components`, `./hooks`, `./types`).
2. **Constants & Enums**: Defined outside or at top of component.
3. **Component Body**:
   - Primary hooks (`useTranslation`, page custom hooks, `useState`, `useReducer`, `useActionState`).
   - Transitions & Deferred values (`useTransition`, `useDeferredValue`, `useOptimistic`).
   - Memos (`useMemo` for derived computations, table columns, options).
   - Side effects (`useEffect` strictly for external sync).
   - Callbacks (`useCallback` for stable handlers).
   - Return statement (assigning JSX/elements to explicit variables).

---

## 2. Modern React Hooks (React 18 & React 19)

### `use` (Resource & Promise / Context Resolution)
The `use` API reads the value of a resource (such as a Promise or Context) directly inside render. Unlike standard hooks, `use` can be invoked conditionally within `if` blocks or loops:

```tsx
import { use } from "react";

const FeatureDetails = ({ dataPromise }: { dataPromise: Promise<FeatureData> }) => {
  const data = use(dataPromise); // Suspends until promise resolves

  return <div>{data.name}</div>;
};
```

### `useActionState` (Async Actions & Form State)
Replaces manual `isLoading` + `try/catch` boilerplate for form submissions and async actions:

```tsx
import { useActionState } from "react";

const [state, formAction, isPending] = useActionState(
  async (previousState: FormState, formData: FormData) => {
    const response = await saveFeatureAction(formData);
    return response;
  },
  initialState,
);

return (
  <form action={formAction}>
    <button type="submit" disabled={isPending}>
      {isPending ? "Saving..." : "Save"}
    </button>
  </form>
);
```

### `useOptimistic` (Instant Optimistic UI Updates)
Displays optimistic state while an asynchronous mutation is in flight, automatically rolling back if the action fails:

```tsx
import { useOptimistic } from "react";

const [optimisticFeatures, setOptimisticFeatures] = useOptimistic(
  features,
  (currentFeatures, newFeature: Feature) => [...currentFeatures, { ...newFeature, sending: true }],
);

const handleAdd = async (newFeature: Feature) => {
  setOptimisticFeatures(newFeature);
  await createFeatureMutation(newFeature);
};
```

### `useFormStatus` (Nested Form Submission Status)
Provides status information of the parent `<form>` to deeply nested child components without prop drilling:

```tsx
import { useFormStatus } from "react-dom";

export const SubmitButton = () => {
  const { pending, data, method } = useFormStatus();

  return (
    <Button type="primary" htmlType="submit" loading={pending}>
      Submit
    </Button>
  );
};
```

### `useTransition` & `startTransition` (Non-blocking UI Updates)
Marks state updates as transitions, allowing urgent interactions (typing, clicking tabs) to interrupt slower rendering tasks:

```tsx
import { useTransition } from "react";

const [isPending, startTransition] = useTransition();

const handleTabChange = (nextTab: string) => {
  startTransition(() => {
    setActiveTab(nextTab);
  });
};
```

### `useDeferredValue` (Deferred Rendering for Search Inputs)
Defers updating a computationally heavy part of the UI until more urgent updates complete:

```tsx
import { useDeferredValue, useState } from "react";

const [searchQuery, setSearchQuery] = useState("");
const deferredQuery = useDeferredValue(searchQuery);

// Filter computationally heavy list against deferredQuery:
const filteredItems = useMemo(
  () => items.filter((item) => item.name.includes(deferredQuery)),
  [items, deferredQuery],
);
```

### `useId` (Accessible Form ID Generation)
Generates unique, deterministic IDs for connecting form labels and ARIA accessibility attributes:

```tsx
import { useId } from "react";

const inputId = useId();
return (
  <>
    <label htmlFor={inputId}>Username</label>
    <input id={inputId} type="text" />
  </>
);
```

### `useSyncExternalStore` (Concurrent-Safe Store Subscriptions)
Subscribes to external stores (e.g., custom browser event emitters, window dimensions) preventing tearing during concurrent rendering:

```tsx
import { useSyncExternalStore } from "react";

const isOnline = useSyncExternalStore(
  (callback) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("offline", callback);
    };
  },
  () => navigator.onLine,
);
```

---

## 3. Disciplined Traditional Hook Usage

- **`useMemo`**: Apply to computationally intensive calculations or when preserving referential stability for props passed to memoized children (options, columns, filters).
- **`useCallback`**: Apply when passing event handler callbacks down to optimized child components wrapped with `React.memo`.
- **`useEffect`**: Restrict strictly to synchronizing with external systems (DOM event listeners, timers, subscriptions). Do NOT use `useEffect` to derive state that can be computed directly during render.

---

## 4. Asynchronous UI & State Recovery

- Always provide explicit UI states for `Loading`, `Error`, `Empty`, and `Success` across all asynchronous data flows.
- Leverage `Suspense` and `ErrorBoundary` components to isolate sub-tree loading and error handling.
- Preserve partially filled form inputs during recoverable network or validation failures.
