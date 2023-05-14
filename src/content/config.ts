import { z, defineCollection } from "astro:content";
import { zonedTimeToUtc } from "date-fns-tz";

// スキーマを定義
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z
      .string()
      .transform((str: string) => zonedTimeToUtc(str, "Asia/Tokyo")),
    image: z.string(),
    category: z.array(z.string()),
    description: z.string(),
  }),
});

// 定義したスキーマを collections としてエクスポート
export const collections = {
  // src/content に用意したコレクションのスキーマとして指定（フォルダ名とフィールド名を一致させる必要がある）
  blog: blogCollection,
};
