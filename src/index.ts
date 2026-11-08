/// <reference types="bun-types" />
import { Elysia } from "elysia";
import { authModules } from "./modules/auth";
import openapi from "@elysia/openapi";
import { userModules } from "./modules/users";
import { categoryModules } from "./modules/category";
import { errorHandler } from "./plugin/errorHandler";
import { transactionModules } from "./modules/transaction";
import { walletModules } from "./modules/wallet";
import { budgetsModules } from "./modules/budgets";
import { reportModules } from "./modules/reports";
import { exportModules } from "./modules/export";
import cors from "@elysiajs/cors";

// Origin frontend yang diizinkan, pisahkan dengan koma.
// Contoh: http://localhost:5173,https://duitku.vercel.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  )
  .use(openapi())
  .use(errorHandler)
  .use(authModules)
  .use(userModules)
  .use(categoryModules)
  .use(transactionModules)
  .use(walletModules)
  .use(budgetsModules)
  .use(reportModules)
  .use(exportModules)
  .get("/cronjob", () => {
    return {
      status: "ok"
    }
  });

// Vercel mendeteksi Elysia lewat default export ini.
// app.listen() tidak boleh dipanggil di sini — lihat src/serve.ts untuk lokal.
export default app;
