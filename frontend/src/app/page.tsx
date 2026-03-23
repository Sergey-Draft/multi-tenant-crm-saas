import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Multi-tenant CRM SaaS
      </h1>
      <Link href="/login" >Войти</Link>
    </main>
  )
}