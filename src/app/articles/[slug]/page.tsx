import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllArticleSlugs,
  getArticleBySlug,
  markdownToHtml,
} from "@/lib/articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = getArticleBySlug(slug);
    return {
      title: `${article.title} — NVMe Explorer`,
      description: article.description,
    };
  } catch {
    return { title: "Article Not Found" };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let article;
  try {
    article = getArticleBySlug(slug);
  } catch {
    notFound();
  }

  const contentHtml = await markdownToHtml(article.content);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link
          href="/articles"
          className="text-gray-500 hover:text-nvme-accent transition-colors"
          prefetch={false}
        >
          Articles
        </Link>
        <span className="text-gray-600 mx-2">/</span>
        <span className="text-gray-300">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <time className="text-sm text-gray-500">{article.date}</time>
          <div className="flex gap-1">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-nvme-gray rounded-full text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{article.title}</h1>
        <p className="text-gray-400 text-lg">{article.description}</p>
      </header>

      {/* YouTube embed */}
      {article.youtubeId && (
        <div className="mb-8 aspect-video rounded-xl overflow-hidden bg-nvme-dark">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${article.youtubeId}`}
            title={article.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Article content */}
      <article
        className="article-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-gray-800">
        <Link
          href="/articles"
          className="text-nvme-accent hover:underline"
          prefetch={false}
        >
          &larr; Back to Articles
        </Link>
      </div>
    </div>
  );
}
