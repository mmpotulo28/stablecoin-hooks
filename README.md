# 🚀 @mmpotulo/stablecoin-hooks

**React hooks for stablecoin operations, built on top of the Lisk stablecoin API.**

---

## ✨ Features

-   Easy integration of stablecoin operations in React apps
-   Caching, error handling, and loading states built-in
-   TypeScript support for all hooks and types
-   Modular hooks for balances, bank, business, charges, coupons, staff, transactions, transfers, users, and API tokens

---

## 📦 Installation

```bash
npm install @mmpotulo/stablecoin-hooks
```

---

## 🛠️ Usage

1. **Set up your environment variable:**

    Add to your `.env.local`:

    ```
    NEXT_PUBLIC_LISK_API_BASE=https://your-lisk-api-url.com/api/v1
    ```

2. **Import and use hooks in your React components:**

    ```typescript
    import { useLiskBalances, useLiskBank, useLiskCharges } from "@mmpotulo/stablecoin-hooks";

    const { balances, fetchBalances } = useLiskBalances({ apiKey: "your-api-key" });
    const { bankAccount, getBankAccount } = useLiskBank({ apiKey: "your-api-key", user });
    const { charges, fetchCharges } = useLiskCharges({ apiKey: "your-api-key", user });
    ```

3. **API Key**

    Most hooks require an `apiKey` parameter for authentication:

    ```typescript
    const { balances } = useLiskBalances({ apiKey: "your-api-key" });
    ```

---

## 🧩 Available Hooks

-   `useLiskBalances`
-   `useLiskBank`
-   `useLiskBusiness`
-   `useLiskCharges`
-   `useLiskCoupons`
-   `useLiskStaff`
-   `useLiskTransactions`
-   `useLiskTransfer`
-   `useLiskUsers`
-   `useCache`
-   `useLiskApiTokens`
-   `useStaff`

Each hook provides loading, error, and message states, plus API methods for CRUD operations.

---

## 📝 Types

All types are exported for use in your app:

```typescript
import { iUser, iTransaction, iCharge, iBankAccount, ... } from "@mmpotulo/stablecoin-hooks";
```

---

## 🧑‍💻 Development Guidelines

### Prerequisites

-   Node.js >= 18
-   npm >= 9
-   TypeScript

### Scripts

-   **Build:**
    ```bash
    npm run build
    ```
-   **Prebuild (auto version bump):**
    Automatically bumps the package version and cleans the dist folder before building.
-   **Publish:**
    Publishing is automated via GitHub Actions on push to `main`.

### Contributing

1. Fork the repo and clone locally.
2. Create a new branch for your feature or fix.
3. Write tests and ensure all hooks are type-safe.
4. Run `npm run build` before committing.
5. Submit a PR with a clear description.

### Project Structure

```
hooks/         # All React hooks
types.ts       # Shared TypeScript types
scripts/       # Utility scripts (e.g., version bump)
dist/          # Compiled output
.github/       # GitHub Actions workflows
```

---

## 🏗️ Example: Using a Hook

```typescript
import { useLiskUsers } from "@mmpotulo/stablecoin-hooks";

const { users, fetchUsers, usersLoading, usersError } = useLiskUsers({ apiKey: "your-api-key" });

useEffect(() => {
	fetchUsers();
}, []);
```

---

## 🛡️ Best Practices

-   Always provide a valid `apiKey` to hooks.
-   Use the loading and error states for UX feedback.
-   Purge cache when you need fresh data:
    `fetchUsers(true)` or `fetchBalances(userId, true)`
-   Keep your `.env.local` secure and never commit secrets.

---

## 📚 More Info

-   See the source code for details on each hook's API and return values.
-   For advanced usage, check out the types and interfaces in `types.ts`.

---

## 🏁 License

MIT © mmpotulo

---
