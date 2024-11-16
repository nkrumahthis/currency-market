# Currency Market

A Platform connecting businesses with excess currency to those who need it.

This project is part of my application to join capi-money, a YC23 company that provides
>an alternative source of foreign currency by finding organisations that are sending money into Senegal and therefore want XOF and are willing to trade Euros for it

This is a matching engine that:

1. Automatically pairs businesses who need EUR with those who need XOF
2. Optimizes for the best possible exchange rates
3. Handles real-time updates and matching
4. Includes risk management and compliance
5. Provides a real-time UI

Built with [Next.js](https://nextjs.org).

## Goals

- A real-time matching algorithm
- Basic KYC/AML compliance built in
- Queuing system for currency requests
- Rate negotiations

## Getting Started

First, install dependencies

```bash
npm install
```

Run the backend server

```bash
npm run backend
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To test,

```bash
npm run test
```
