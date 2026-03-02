import {
  handleRegister,
  handleLogin,
  handleCreateMarket,
  handleListMarkets,
  handleGetMarket,
  handlePlaceBet,
} from "./src/api/handlers";

const PORT = process.env.PORT || 4001;

const routes: Record<
  string,
  (req: Request, ...params: any[]) => Promise<Response>
> = {
  "POST /api/auth/register": handleRegister,
  "POST /api/auth/login": handleLogin,
  "POST /api/markets": handleCreateMarket,
  "GET /api/markets": handleListMarkets,
};

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method;

  // Handle CORS
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Add CORS headers to all responses
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Route: GET /api/markets/:id
  const marketMatch = pathname.match(/^\/api\/markets\/(\d+)$/);
  if (method === "GET" && marketMatch) {
    const marketId = parseInt(marketMatch[1], 10);
    const response = await handleGetMarket(req, marketId);
    return new Response(response.body, {
      status: response.status,
      headers: { ...Object.fromEntries(response.headers), ...cors },
    });
  }

  // Route: POST /api/markets/:id/bets
  const betMatch = pathname.match(/^\/api\/markets\/(\d+)\/bets$/);
  if (method === "POST" && betMatch) {
    const marketId = parseInt(betMatch[1], 10);
    const response = await handlePlaceBet(req, marketId);
    return new Response(response.body, {
      status: response.status,
      headers: { ...Object.fromEntries(response.headers), ...cors },
    });
  }

  // Check static routes
  const routeKey = `${method} ${pathname}`;
  const handler = routes[routeKey];

  if (handler) {
    const response = await handler(req);
    return new Response(response.body, {
      status: response.status,
      headers: { ...Object.fromEntries(response.headers), ...cors },
    });
  }

  // 404
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...cors,
    },
  });
}

console.log(`🚀 Server running at http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  fetch: handleRequest,
});
