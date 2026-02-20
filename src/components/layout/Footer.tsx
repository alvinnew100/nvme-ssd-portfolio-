import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-nvme-dark border-t border-warm-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-warm-50 font-semibold mb-3">NVMe Explorer</h3>
            <p className="text-warm-400 text-sm">
              Interactive NVMe command reference, ftrace decoder, and educational
              resource for SSD/NVMe engineers.
            </p>
          </div>
          <div>
            <h3 className="text-warm-50 font-semibold mb-3">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/commands" className="text-warm-400 hover:text-nvme-accent transition-colors" prefetch={false}>
                  Command Reference
                </Link>
              </li>
              <li>
                <Link href="/trace-decoder" className="text-warm-400 hover:text-nvme-accent transition-colors" prefetch={false}>
                  Ftrace Decoder
                </Link>
              </li>
              <li>
                <Link href="/command-builder" className="text-warm-400 hover:text-nvme-accent transition-colors" prefetch={false}>
                  Command Builder
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="text-warm-400 hover:text-nvme-accent transition-colors" prefetch={false}>
                  Architecture
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-warm-50 font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/articles" className="text-warm-400 hover:text-nvme-accent transition-colors" prefetch={false}>
                  Articles
                </Link>
              </li>
              <li>
                <a
                  href="https://nvmexpress.org/specifications/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-400 hover:text-nvme-accent transition-colors"
                >
                  NVMe Spec
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-warm-800 text-center text-warm-500 text-sm">
          Built to demonstrate SSD/NVMe expertise. Based on NVMe Base
          Specification 2.0.
        </div>
      </div>
    </footer>
  );
}
