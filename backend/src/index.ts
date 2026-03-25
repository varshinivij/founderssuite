import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { payToCreateAgent } from "./middleware/x402.js";
import usersRouter from "./routes/users.js";
import agentsRouter from "./routes/agents.js";
import formsRouter from "./routes/forms.js";
import matchesRouter from "./routes/matches.js";
import paymentsRouter from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Routes ────────────────────────────────────────────────────────────────────
// User story creation (POST /:id/stories) is behind x402 payment.
// The payToCreateAgent middleware returns 402 if the client has not paid.
app.use("/users", payToCreateAgent, usersRouter);
app.use("/agents", agentsRouter);
app.use("/forms", formsRouter);
app.use("/matches", matchesRouter);
app.use("/payments", paymentsRouter);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`FoundersSuite backend running on http://localhost:${PORT}`);
});

export default app;
