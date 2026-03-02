import { eq, and } from "drizzle-orm";
import db from "../db";
import {
  usersTable,
  marketsTable,
  marketOutcomesTable,
  betsTable,
} from "../db/schema";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  getUserFromToken,
} from "../lib/auth";
import {
  validateRegistration,
  validateLogin,
  validateMarketCreation,
  validateBet,
} from "../lib/validation";

/**
 * Parse JSON from request
 */
async function parseJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/**
 * Get user from request headers
 */
async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return await getUserFromToken(token);
}

/**
 * Register a new user
 */
export async function handleRegister(req: Request) {
  const body = await parseJson(req);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { username, email, password } = body;
  const errors = validateRegistration(username, email, password);

  if (errors.length > 0) {
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if user exists
  const existingUser = await db.query.usersTable.findFirst({
    where: (users, { or, eq }) =>
      or(eq(users.email, email), eq(users.username, username)),
  });

  if (existingUser) {
    return new Response(
      JSON.stringify({
        errors: [{ field: "email", message: "User already exists" }],
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const passwordHash = await hashPassword(password);

  const newUser = await db
    .insert(usersTable)
    .values({
      username,
      email,
      passwordHash,
    })
    .returning();

  const token = createSessionToken(newUser[0].id);

  return new Response(
    JSON.stringify({
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      token,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Login a user
 */
export async function handleLogin(req: Request) {
  const body = await parseJson(req);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, password } = body;
  const errors = validateLogin(email, password);

  if (errors.length > 0) {
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return new Response(
      JSON.stringify({ error: "Invalid email or password" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const token = createSessionToken(user.id);

  return new Response(
    JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Create a new market
 */
export async function handleCreateMarket(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await parseJson(req);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { title, description, outcomes } = body;
  const errors = validateMarketCreation(title, description, outcomes);

  if (errors.length > 0) {
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const market = await db
    .insert(marketsTable)
    .values({
      title,
      description: description || null,
      createdBy: user.id,
    })
    .returning();

  const outcomeIds = await db
    .insert(marketOutcomesTable)
    .values(
      outcomes.map((title: string, index: number) => ({
        marketId: market[0].id,
        title,
        position: index,
      }))
    )
    .returning();

  return new Response(
    JSON.stringify({
      id: market[0].id,
      title: market[0].title,
      description: market[0].description,
      status: market[0].status,
      outcomes: outcomeIds,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Get all markets with basic info
 */
export async function handleListMarkets(req: Request) {
  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") || "active";

  const markets = await db.query.marketsTable.findMany({
    where: eq(marketsTable.status, statusFilter),
    with: {
      creator: {
        columns: { username: true },
      },
      outcomes: {
        orderBy: (outcomes, { asc }) => asc(outcomes.position),
      },
    },
  });

  // Calculate total bets and odds for each outcome
  const enrichedMarkets = await Promise.all(
    markets.map(async (market) => {
      const betsPerOutcome = await Promise.all(
        market.outcomes.map(async (outcome) => {
          const totalBets = await db
            .select()
            .from(betsTable)
            .where(eq(betsTable.outcomeId, outcome.id));

          const totalAmount = totalBets.reduce((sum, bet) => sum + bet.amount, 0);
          return { outcomeId: outcome.id, totalBets: totalAmount };
        })
      );

      const totalMarketBets = betsPerOutcome.reduce(
        (sum, b) => sum + b.totalBets,
        0
      );

      return {
        id: market.id,
        title: market.title,
        status: market.status,
        creator: market.creator?.username,
        outcomes: market.outcomes.map((outcome) => {
          const outcomeBets =
            betsPerOutcome.find((b) => b.outcomeId === outcome.id)?.totalBets ||
            0;
          const odds =
            totalMarketBets > 0
              ? Number(((outcomeBets / totalMarketBets) * 100).toFixed(2))
              : 0;

          return {
            id: outcome.id,
            title: outcome.title,
            odds,
            totalBets: outcomeBets,
          };
        }),
        totalMarketBets,
      };
    })
  );

  return new Response(JSON.stringify(enrichedMarkets), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Get market detail
 */
export async function handleGetMarket(req: Request, marketId: number) {
  const market = await db.query.marketsTable.findFirst({
    where: eq(marketsTable.id, marketId),
    with: {
      creator: {
        columns: { username: true },
      },
      outcomes: {
        orderBy: (outcomes, { asc }) => asc(outcomes.position),
      },
    },
  });

  if (!market) {
    return new Response(JSON.stringify({ error: "Market not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const betsPerOutcome = await Promise.all(
    market.outcomes.map(async (outcome) => {
      const totalBets = await db
        .select()
        .from(betsTable)
        .where(eq(betsTable.outcomeId, outcome.id));

      const totalAmount = totalBets.reduce((sum, bet) => sum + bet.amount, 0);
      return { outcomeId: outcome.id, totalBets: totalAmount };
    })
  );

  const totalMarketBets = betsPerOutcome.reduce((sum, b) => sum + b.totalBets, 0);

  return new Response(
    JSON.stringify({
      id: market.id,
      title: market.title,
      description: market.description,
      status: market.status,
      creator: market.creator?.username,
      outcomes: market.outcomes.map((outcome) => {
        const outcomeBets =
          betsPerOutcome.find((b) => b.outcomeId === outcome.id)?.totalBets || 0;
        const odds =
          totalMarketBets > 0
            ? Number(((outcomeBets / totalMarketBets) * 100).toFixed(2))
            : 0;

        return {
          id: outcome.id,
          title: outcome.title,
          odds,
          totalBets: outcomeBets,
        };
      }),
      totalMarketBets,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Place a bet
 */
export async function handlePlaceBet(req: Request, marketId: number) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await parseJson(req);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { outcomeId, amount } = body;
  const errors = validateBet(amount);

  if (errors.length > 0) {
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const market = await db.query.marketsTable.findFirst({
    where: eq(marketsTable.id, marketId),
  });

  if (!market) {
    return new Response(JSON.stringify({ error: "Market not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (market.status !== "active") {
    return new Response(JSON.stringify({ error: "Market is not active" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const outcome = await db.query.marketOutcomesTable.findFirst({
    where: and(
      eq(marketOutcomesTable.id, outcomeId),
      eq(marketOutcomesTable.marketId, marketId)
    ),
  });

  if (!outcome) {
    return new Response(JSON.stringify({ error: "Outcome not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const bet = await db
    .insert(betsTable)
    .values({
      userId: user.id,
      marketId,
      outcomeId,
      amount: Number(amount),
    })
    .returning();

  return new Response(
    JSON.stringify({
      id: bet[0].id,
      userId: bet[0].userId,
      marketId: bet[0].marketId,
      outcomeId: bet[0].outcomeId,
      amount: bet[0].amount,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}
