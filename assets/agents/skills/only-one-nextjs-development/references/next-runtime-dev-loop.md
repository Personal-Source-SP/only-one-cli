# Next.js Runtime Dev Loop & Debugging

## Frontend Runtime Verification & Debugging Workflow

### 1. Preconditions & Fast Loop Setup
- Confirm the `next dev` development server is running along with the target URL.
- Inspect Next.js version, bundler (e.g., Turbopack or Webpack), browser tools, and user authentication state.
- Preserve existing user login sessions; never ask for credentials in chat transcripts.

### 2. Runtime Dev Loop Workflow
- Execute changes in the smallest scoped vertical edit.
- Monitor compile/runtime diagnostics in the terminal and Next.js overlay logs.
- Perform direct browser verification: rendered DOM content, loading/error/empty states, browser console errors, failed network requests, and user interactions.
- Correlate browser feedback with server logs, route diagnostics, and RSC / Server Action exceptions.
- Re-verify runtime behavior iteratively. Typechecks and builds never substitute for live runtime verification.

### 3. Debug-Friendly Variable Binding
- ALWAYS bind computed values or promise results to explicit intermediate variables prior to returning (`const result = ...; return result;`) to support breakpoint inspection during debug sessions.
