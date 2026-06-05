import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="vb-methodology">
      <main className="vb-methodology__main">
        <h1>Page not found</h1>
        <p>
          <Link href="/">Back to Validator Beat</Link>
        </p>
      </main>
    </div>
  );
}
