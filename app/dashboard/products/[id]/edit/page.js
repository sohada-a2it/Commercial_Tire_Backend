import ProductEditorPage from "@/components/Dashboard/ProductEditorPage";

export default function EditProductPage({ params }) {
  return <ProductEditorPage mode="edit" productId={params?.id || ""} />;
}
