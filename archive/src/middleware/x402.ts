/**
 * x402 payment middleware
 *
 * Wraps specific routes behind HTTP 402 payment-required using the x402
 * protocol (https://x402.org). Clients must pay USDC on Base before the
 * request is processed.
 *
 * Usage:
 *   router.post("/agents", payToCreate, agentsController.create);
 */
import { paymentMiddleware } from "x402-express";

const facilitatorUrl =
  process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator";

const walletAddress = process.env.WALLET_ADDRESS ?? "";
const network = (process.env.NETWORK ?? "base-sepolia") as
  | "base-sepolia"
  | "base";
const agentPriceUsdc = parseFloat(
  process.env.AGENT_CREATION_PRICE_USDC ?? "1.00"
);

/**
 * Gate: user must pay USDC per agent created.
 * Each user story → 1 agent → 1 payment of AGENT_CREATION_PRICE_USDC.
 */
export const payToCreateAgent = paymentMiddleware(
  walletAddress,
  {
    "POST /agents": {
      price: `$${agentPriceUsdc}`,
      network,
      config: { description: "Create an AI agent from your story" },
    },
  },
  { facilitatorUrl }
);
