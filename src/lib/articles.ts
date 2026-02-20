import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { Article } from "./nvme/types";

const articlesDirectory = path.join(process.cwd(), "content/articles");

export function getAllArticleSlugs(): string[] {
  const fileNames = fs.readdirSync(articlesDirectory);
  return fileNames
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export function getArticleBySlug(slug: string): Article {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ? String(data.date).split("T")[0] : "",
    tags: data.tags ?? [],
    youtubeId: data.youtubeId ?? "",
    description: data.description ?? "",
    content,
  };
}

export function getAllArticles(): Article[] {
  const slugs = getAllArticleSlugs();
  return slugs
    .map(getArticleBySlug)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
