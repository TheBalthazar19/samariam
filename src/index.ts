import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const app = new Hono();

// Use @neondatabase/serverless Pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

app.get("/", (c) => c.text("Hello Hono!"));

// GET /countries
app.get("/countries", async (c) => {
  const countries = await prisma.country.findMany();
  return c.json(countries);
});

// POST /countries
app.post("/countries", async (c) => {
  const { name, countryCode } = await c.req.json();
  const country = await prisma.country.create({ data: { name, countryCode } });
  return c.json(country, 201);
});

// PATCH /countries/:countryCode
app.patch("/countries/:countryCode", async (c) => {
  const countryCode = c.req.param("countryCode");
  const { name } = await c.req.json();
  const updatedCountry = await prisma.country.update({
    where: { countryCode },
    data: { name },
  });
  return c.json(updatedCountry);
});

// DELETE /countries/:countryCode
app.delete("/countries/:countryCode", async (c) => {
  const countryCode = c.req.param("countryCode");
  await prisma.country.delete({ where: { countryCode } });
  return c.json({ message: "Country deleted" });
});

serve(
  { fetch: app.fetch, port: 3000 },
  (info) => console.log(`Server running at http://localhost:${info.port}`)
);
