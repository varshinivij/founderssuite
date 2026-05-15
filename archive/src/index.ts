import "dotenv/config";
import express, { type RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi.js";
import usersRouter from "./routes/users.js";
import agentsRouter from "./routes/agents.js";
import formsRouter from "./routes/forms.js";
import matchesRouter from "./routes/matches.js";
import paymentsRouter from "./routes/payments.js";
import feedbackRouter from "./routes/feedback.js";
import { seedDb } from "./seed.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet({ contentSecurityPolicy: false })); // CSP off so Swagger UI loads
app.use(cors());
app.use(express.json());

// ── API Docs ──────────────────────────────────────────────────────────────────
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/openapi.json", (_req, res) => res.json(openApiSpec));

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── x402 payment gate ─────────────────────────────────────────────────────────
// Only enforce when WALLET_ADDRESS is configured; skip silently in dev/demo mode.
const paymentGate: RequestHandler = process.env.WALLET_ADDRESS
  ? (() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { payToCreateAgent } = require("./middleware/x402.js") as { payToCreateAgent: RequestHandler };
        return payToCreateAgent;
      } catch {
        console.warn("x402 middleware unavailable — running without payment gate");
        return (_req: Parameters<RequestHandler>[0], _res: Parameters<RequestHandler>[1], next: Parameters<RequestHandler>[2]) => next();
      }
    })()
  : (_req, _res, next) => next();

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/users", paymentGate, usersRouter);
app.use("/agents", agentsRouter);
app.use("/forms", formsRouter);
app.use("/matches", matchesRouter);
app.use("/payments", paymentsRouter);
app.use("/feedback", feedbackRouter);

// ── Seed demo data ────────────────────────────────────────────────────────────
seedDb();

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`FoundersSuite backend running on http://localhost:${PORT}`);
});

export default app;
