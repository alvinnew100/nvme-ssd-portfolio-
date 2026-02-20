export default function StoryFooter() {
  return (
    <footer className="border-t border-story-border py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-text-muted text-sm">
          NVMe Explorer &mdash; An interactive guide to NVMe storage technology
        </p>
        <p className="text-text-muted text-xs mt-2">
          Built with Next.js. Reference:{" "}
          <a
            href="https://nvmexpress.org/specifications/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-nvme-green hover:underline"
          >
            NVM Express Base Specification
          </a>
        </p>
      </div>
    </footer>
  );
}
