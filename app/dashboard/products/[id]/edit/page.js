import ProductEditorPage from "@/components/Dashboard/ProductEditorPage";
import fs from "fs/promises";
import path from "path";

const getCatalogPath = () => path.resolve(process.cwd(), "public", "categories.json");

export async function generateStaticParams() {
  try {
    const raw = await fs.readFile(getCatalogPath(), "utf8");
    const parsed = JSON.parse(raw);
    const categories = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.categories) ? parsed.categories : [];

    const ids = new Set();
    for (const category of categories) {
      for (const subcategory of category?.subcategories || []) {
        for (const product of subcategory?.products || []) {
          const sourceId = product?.id;
          if (sourceId !== undefined && sourceId !== null && sourceId !== "") {
            ids.add(String(sourceId));
          }
        }
      }
    }

    return Array.from(ids).map((id) => ({ id }));
  } catch (_error) {
    return [];
  }
}

export default function EditProductPage({ params }) {
  return <ProductEditorPage mode="edit" productId={params?.id || ""} />;
}
