export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FoundersSuite API",
    version: "1.0.0",
    description:
      "Users add their experience/problem/story → AI agents are created automatically. Each agent monitors founder ValidationForms, scores relevance via a DQN policy, and auto-fills + submits forms on the user's behalf. Agent creation requires an x402 USDC micropayment.",
  },
  servers: [{ url: "http://localhost:3001", description: "Local dev" }],
  tags: [
    { name: "Health" },
    { name: "Users" },
    { name: "Agents" },
    { name: "Forms" },
    { name: "Matches" },
    { name: "Feedback & RL" },
    { name: "Payments" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness check",
        responses: { "200": { description: "OK", content: { "application/json": { schema: { example: { status: "ok" } } } } } },
      },
    },

    // ── Users ──────────────────────────────────────────────────────────────
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUser" },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "400": { description: "Validation error" },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user profile",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: {
          "200": { description: "User", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "404": { description: "Not found" },
        },
      },
    },
    "/users/{id}/stories": {
      post: {
        tags: ["Users"],
        summary: "Add story / experience / problem — auto-creates an agent",
        description:
          "**Requires x402 payment** ($1.00 USDC on Base by default). The server returns 402 with payment requirements if no valid payment header is present. After payment the agent is created immediately and begins monitoring forms.",
        parameters: [{ $ref: "#/components/parameters/id" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateStory" } } },
        },
        responses: {
          "201": {
            description: "Story + auto-created agent",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StoryWithAgent" } } },
          },
          "402": { description: "x402 payment required" },
          "404": { description: "User not found" },
        },
      },
      get: {
        tags: ["Users"],
        summary: "List all stories for a user",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "200": { description: "Stories", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Story" } } } } } },
      },
    },
    "/users/{id}/stories/{storyId}": {
      delete: {
        tags: ["Users"],
        summary: "Delete a story",
        parameters: [{ $ref: "#/components/parameters/id" }, { name: "storyId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "204": { description: "Deleted" }, "404": { description: "Not found" } },
      },
    },

    // ── Agents ─────────────────────────────────────────────────────────────
    "/agents/user/{userId}": {
      get: {
        tags: ["Agents"],
        summary: "List all agents for a user",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Agents", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Agent" } } } } } },
      },
    },
    "/agents/{id}": {
      get: {
        tags: ["Agents"],
        summary: "Get agent detail + stats",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "200": { description: "Agent", content: { "application/json": { schema: { $ref: "#/components/schemas/Agent" } } } }, "404": { description: "Not found" } },
      },
      delete: {
        tags: ["Agents"],
        summary: "Delete an agent",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "204": { description: "Deleted" }, "404": { description: "Not found" } },
      },
    },
    "/agents/{id}/activate": {
      post: { tags: ["Agents"], summary: "Resume a paused agent", parameters: [{ $ref: "#/components/parameters/id" }], responses: { "200": { description: "Agent activated" }, "404": { description: "Not found" } } },
    },
    "/agents/{id}/pause": {
      post: { tags: ["Agents"], summary: "Pause agent monitoring", parameters: [{ $ref: "#/components/parameters/id" }], responses: { "200": { description: "Agent paused" }, "404": { description: "Not found" } } },
    },
    "/agents/{id}/stop": {
      post: { tags: ["Agents"], summary: "Permanently stop agent", parameters: [{ $ref: "#/components/parameters/id" }], responses: { "200": { description: "Agent stopped" }, "404": { description: "Not found" } } },
    },
    "/agents/{id}/matches": {
      get: {
        tags: ["Agents"],
        summary: "List all matches/submissions for an agent",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "200": { description: "Matches", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Match" } } } } } },
      },
    },

    // ── Forms ──────────────────────────────────────────────────────────────
    "/forms": {
      post: {
        tags: ["Forms"],
        summary: "Create a validation form — immediately triggers agent matching",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateForm" } } } },
        responses: {
          "201": {
            description: "Form created + matches triggered",
            content: { "application/json": { schema: { $ref: "#/components/schemas/FormWithMatches" } } },
          },
        },
      },
      get: {
        tags: ["Forms"],
        summary: "List all open forms",
        responses: { "200": { description: "Forms", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Form" } } } } } },
      },
    },
    "/forms/{id}": {
      get: {
        tags: ["Forms"],
        summary: "Get form details",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "200": { description: "Form", content: { "application/json": { schema: { $ref: "#/components/schemas/Form" } } } }, "404": { description: "Not found" } },
      },
    },
    "/forms/{id}/close": {
      post: { tags: ["Forms"], summary: "Close form (stop accepting submissions)", parameters: [{ $ref: "#/components/parameters/id" }], responses: { "200": { description: "Form closed" } } },
    },
    "/forms/{id}/submissions": {
      get: {
        tags: ["Forms"],
        summary: "List all agent-submitted answers for a form",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "200": { description: "Submissions", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Match" } } } } } },
      },
    },

    // ── Matches ────────────────────────────────────────────────────────────
    "/matches/user/{userId}": {
      get: {
        tags: ["Matches"],
        summary: "All matches across all of a user's agents",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Matches", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Match" } } } } } },
      },
    },
    "/matches/{id}": {
      get: {
        tags: ["Matches"],
        summary: "Get single match detail",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "200": { description: "Match", content: { "application/json": { schema: { $ref: "#/components/schemas/Match" } } } }, "404": { description: "Not found" } },
      },
    },

    // ── Feedback / RL ──────────────────────────────────────────────────────
    "/feedback/{matchId}": {
      post: {
        tags: ["Feedback & RL"],
        summary: "Record founder outcome → trains agent DQN policy",
        description:
          "Primary RL training signal. Each call runs one backprop step on the agent that submitted this match. Over time agents explore less and submit only to high-quality matches.",
        parameters: [{ name: "matchId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["outcome"],
                properties: {
                  outcome: { type: "string", enum: ["accepted", "rejected", "opened", "no_response"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Trained",
            content: {
              "application/json": {
                schema: { example: { message: "Feedback recorded — agent trained", outcome: "accepted", agentPolicy: { steps: 42, epsilon: 0.73 } } },
              },
            },
          },
        },
      },
    },
    "/feedback/agent/{agentId}/policy": {
      get: {
        tags: ["Feedback & RL"],
        summary: "Get agent's current RL policy stats (epsilon, training steps)",
        parameters: [{ name: "agentId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Policy stats",
            content: { "application/json": { schema: { example: { trained: true, steps: 120, epsilon: 0.51 } } } },
          },
        },
      },
    },

    // ── Payments ───────────────────────────────────────────────────────────
    "/payments/user/{userId}": {
      get: {
        tags: ["Payments"],
        summary: "List payment records for a user",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Payments", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Payment" } } } } } },
      },
    },
    "/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get single payment record",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { "200": { description: "Payment", content: { "application/json": { schema: { $ref: "#/components/schemas/Payment" } } } }, "404": { description: "Not found" } },
      },
    },
  },

  components: {
    parameters: {
      id: { name: "id", in: "path" as const, required: true, schema: { type: "string", format: "uuid" } },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateUser: {
        type: "object",
        required: ["email", "name"],
        properties: {
          email: { type: "string", format: "email", example: "alice@example.com" },
          name: { type: "string", example: "Alice" },
        },
      },
      Story: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          type: { type: "string", enum: ["experience", "problem", "story"] },
          title: { type: "string" },
          description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateStory: {
        type: "object",
        required: ["type", "title", "description"],
        properties: {
          type: { type: "string", enum: ["experience", "problem", "story"], example: "experience" },
          title: { type: "string", example: "5 years in B2B SaaS sales" },
          description: { type: "string", example: "I led outbound sales at three early-stage startups..." },
          tags: { type: "array", items: { type: "string" }, example: ["sales", "b2b", "saas"] },
        },
      },
      StoryWithAgent: {
        type: "object",
        properties: {
          story: { $ref: "#/components/schemas/Story" },
          agent: { $ref: "#/components/schemas/Agent" },
        },
      },
      Agent: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          storyId: { type: "string", format: "uuid" },
          name: { type: "string", example: "Agent for \"B2B SaaS sales\"" },
          status: { type: "string", enum: ["active", "paused", "stopped"] },
          matchCriteria: { type: "string" },
          filledForms: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          lastActiveAt: { type: "string", format: "date-time" },
        },
      },
      Form: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          founderId: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          targetProfile: { type: "string" },
          questions: { type: "array", items: { $ref: "#/components/schemas/FormQuestion" } },
          status: { type: "string", enum: ["open", "closed"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateForm: {
        type: "object",
        required: ["founderId", "title", "description", "questions", "targetProfile"],
        properties: {
          founderId: { type: "string", format: "uuid" },
          title: { type: "string", example: "Looking for early B2B SaaS advisors" },
          description: { type: "string", example: "Seeking people with hands-on sales experience..." },
          targetProfile: { type: "string", example: "B2B SaaS sales, startup background" },
          questions: { type: "array", items: { $ref: "#/components/schemas/CreateQuestion" } },
        },
      },
      FormQuestion: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          question: { type: "string" },
          type: { type: "string", enum: ["text", "multiChoice", "rating"] },
          options: { type: "array", items: { type: "string" } },
          required: { type: "boolean" },
        },
      },
      CreateQuestion: {
        type: "object",
        required: ["question", "type"],
        properties: {
          question: { type: "string", example: "Describe your B2B sales experience" },
          type: { type: "string", enum: ["text", "multiChoice", "rating"] },
          options: { type: "array", items: { type: "string" }, example: ["1–5", "5–20", "20+"] },
          required: { type: "boolean", default: true },
        },
      },
      FormWithMatches: {
        type: "object",
        properties: {
          form: { $ref: "#/components/schemas/Form" },
          matchesTriggered: { type: "integer", example: 3 },
        },
      },
      Match: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          agentId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          formId: { type: "string", format: "uuid" },
          score: { type: "number", example: 0.82 },
          status: { type: "string", enum: ["pending", "submitted", "rejected"] },
          agentAnswers: { type: "object", additionalProperties: { type: "string" } },
          submittedAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          resource: { type: "string", example: "agent_creation" },
          amountUsdc: { type: "number", example: 1.0 },
          txHash: { type: "string" },
          network: { type: "string", example: "base-sepolia" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
