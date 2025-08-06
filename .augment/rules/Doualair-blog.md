---
type: "manual"
---

**MERN Project Guidelines (TypeScript, React, Express, MongoDB)**

---

### 📊 General Principles

- You are an expert in TypeScript, Node.js, Express.js, React, DaisyUI, Tailwind CSS, and Framer Motion.
- Prioritize code readability, scalability, and modularity.
- Always write production-ready code using modern best practices.

---

### 📁 Code Style & Formatting

- Use **TypeScript** across both frontend and backend.
- Prefer `type` over `interface` for consistency and simplicity.
- Avoid `enum`s; use `Record<string, string>` or object maps.
- Follow **functional programming** principles; avoid class-based components and OOP patterns.
- Use **named exports** for all components and utility functions.
- Always write **concise** and **declarative** code.
- Avoid redundant braces in conditional logic (e.g., single-line if statements).

---

### 📂 File Structure

#### Backend (Express):

```
- routes/
- controllers/
- models/ (Mongoose schemas)
- middleware/
- utils/
```

#### Frontend (React):

```
- components/
  - subcomponents/
- helpers/
- types/
- static/
```

---

### 🔢 Naming Conventions

- Use **kebab-case** for folders and filenames (e.g., `user-controller.ts`, `auth-wizard.tsx`).
- Use **camelCase** for variables and functions.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasPermission`).

---

### ⚖️ Linting & Formatting

- Use **ESLint** with recommended rules for TypeScript and React.
- Use **Prettier** for consistent code formatting.
- Ensure both are integrated into your CI/CD pipeline or pre-commit hooks.

---

### 🛡️ Error Handling

- Always use `try/catch` blocks for async logic.
- Centralize error responses in a **global error handler middleware** (e.g., `errorMiddleware.ts`).
- Never expose internal errors to the client; return user-friendly messages.

---

### ⚖️ Testing

- Use **Jest** for unit and integration testing.
- Use **React Testing Library** for React component testing.
- Structure test files alongside the modules (`*.test.ts`, `*.test.tsx`).
- Mock API and database interactions using libraries like `msw` or `supertest`.

---

### 🖊️ React Guidelines

- Always use functional components:

```tsx
export const MyComponent = (props: Props) => {
  // ...
};
```

- Use `React.memo`, `useCallback`, `useMemo` to optimize performance.
- Implement **lazy loading** (`React.lazy`) with `Suspense` and fallback components.
- Build responsive UIs using **Tailwind CSS** with a **mobile-first** approach.
- Use **DaisyUI** for accessible UI components.
- Animate elements using **Framer Motion** for smooth, declarative motion effects.

---

### 📈 Performance & Best Practices

- Optimize images (WebP, dimensions, lazy loading).
- Use dynamic imports for non-critical components.
- Avoid unnecessary re-renders.
- Optimize Core Web Vitals: LCP, CLS, FID.

---

### 🗖️ MongoDB / Mongoose Guidelines

- Use **Mongoose** as the ODM.
- Define a schema for every collection and enforce types.
- Always use `async/await` for database operations.
- Centralize all models in the `/models` directory.

---

### ⚠️ API & Client Separation

- Keep API routes RESTful and organized by resource.
- Separate backend (Express) and frontend (React) entirely.
- Use environment variables to manage backend URLs and secrets.

---

### ⚛️ Routing & State Management

- Use `react-router-dom` and `useSearchParams` for URL state.
- Avoid global state unless necessary; prefer local component state and URL params.

---

### 🔗 Documentation & References

- Always refer to official docs:

  - [React](https://reactjs.org/docs/getting-started.html)
  - [Express](https://expressjs.com/)
  - [Mongoose](https://mongoosejs.com/docs/guide.html)
  - [Tailwind CSS](https://tailwindcss.com/docs/installation)
  - [TypeScript](https://www.typescriptlang.org/docs/)
  - [Framer Motion](https://www.framer.com/motion/)
