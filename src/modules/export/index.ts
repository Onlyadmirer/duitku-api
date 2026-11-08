import Elysia from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Export } from "./service";
import { exportQuery } from "./model";

export const exportModules = new Elysia({
  prefix: "/export",
  detail: {
    tags: ["Export"]
  }
}).use(authGuard)
  .get("/", async ({ userId, query, set }) => {
    const file = await Export.build(userId, {
      from: query.from,
      to: query.to
    })

    // Tanggal di nama file mengikuti exportedAt (UTC).
    const fileDate = file.exportedAt.slice(0, 10)

    set.headers["content-type"] = "application/json"
    set.headers["content-disposition"] = `attachment; filename="duitku-export-${fileDate}.json"`

    // Dikirim apa adanya, tidak dibungkus { success, data }.
    return file
  }, {
    query: exportQuery
  })
