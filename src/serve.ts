import app from "./index";

const port = Number(process.env.PORT ?? 3000);

app.listen(port);

console.log(`🦊 Elysia is running at http://localhost:${port}/api`);
