import ProductEditorPage from "@/components/Dashboard/ProductEditorPage";

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

export async function generateStaticParams() {
  try {
    const response = await fetch(`${backendUrl}/api/categories/public/products?all=true`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const products = Array.isArray(data?.products) ? data.products : [];

    return products
      .map((product) => product?.id)
      .filter((id) => id !== undefined && id !== null && id !== "")
      .map((id) => ({ id: String(id) }));
  } catch (_error) {
    return [];
  }
}

export default async function EditProductPage({ params }) {
  const resolvedParams = await params;
  return <ProductEditorPage mode="edit" productId={resolvedParams?.id || ""} />;
}
