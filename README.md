# @mmpotulo/stablecoin-hooks

React hooks for stablecoin operations.

## Installation

```bash
npm install @mmpotulo/stablecoin-hooks
```

## Available Hooks

- `useLiskBalances`
- `useLiskBank`
- `useLiskBusiness`
- `useLiskCharges`
- `useLiskCoupons`
- `useLiskStaff`
- `useLiskTransactions`
- `useLiskTransfer`
- `useLiskUsers`
- `useCache`
- `useLiskApiTokens`
- `useStaff`

## Usage Example

```typescript
import { useLiskBalances, useLiskBank, useLiskCharges } from "@mmpotulo/stablecoin-hooks";

const { balances, fetchBalances } = useLiskBalances({ apiKey: "your-api-key" });
const { bankAccount, getBankAccount } = useLiskBank({ apiKey: "your-api-key", user });
const { charges, fetchCharges } = useLiskCharges({ apiKey: "your-api-key", user });
```

## Types

All types are exported from:

```typescript
import { iUser, iTransaction, iCharge, iBankAccount, ... } from "@mmpotulo/stablecoin-hooks";
```

## Required Environment Variables

You must set the following environment variable in your project:

- `NEXT_PUBLIC_LISK_API_BASE` – The base URL for your Lisk API endpoints.

Example in `.env`:

```
NEXT_PUBLIC_LISK_API_BASE=https://your-lisk-api-url.com/api/v1
```

## API Key

Most hooks require an `apiKey` parameter for authentication:

```typescript
const { balances } = useLiskBalances({ apiKey: "your-api-key" });
```

## More

See the source for details on each hook's API and return values.
