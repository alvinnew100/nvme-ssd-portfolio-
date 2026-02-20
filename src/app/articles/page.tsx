import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles — NVMe & SSD Engineering",
  description:
    "Educational articles covering NVMe commands, SSD firmware, NAND flash, PCIe architecture, and storage testing methodology.",
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Articles</h1>
        <p className="text-gray-400">
          In-depth articles covering SSD fundamentals, NVMe internals, and
          storage engineering topics.
        </p>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group block p-6 rounded-xl border border-gray-800 hover:border-gray-600 bg-nvme-dark/50 hover:bg-nvme-dark transition-all"
            prefetch={false}
          >
            <div className="flex items-center gap-3 mb-2">
              <time className="text-xs text-gray-500">{article.date}</time>
              <div className="flex gap-1">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-nvme-gray rounded-full text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white group-hover:text-nvme-accent transition-colors mb-2">
              {article.title}
            </h2>
            <p className="text-gray-400 text-sm">{article.description}</p>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No articles yet. Check back soon!
        </div>
      )}
    </div>
  );
}
