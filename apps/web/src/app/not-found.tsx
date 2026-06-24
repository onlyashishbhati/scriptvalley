import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>404 · Page Not Found</h1>
      <Link href="/">Go home</Link>
    </div>
  );
}