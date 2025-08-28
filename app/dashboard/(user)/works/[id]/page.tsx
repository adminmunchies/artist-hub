// app/dashboard/works/[id]/page.tsx
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

type PageProps = { params: Promise<{ id: string }> };

export default async function WorkDetailRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(routes.workEdit(id));
}
