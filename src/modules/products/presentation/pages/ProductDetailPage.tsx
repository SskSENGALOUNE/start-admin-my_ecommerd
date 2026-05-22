import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { QueryState } from "@/shared/ui/QueryState";
import { Button, Modal, Tabs, TabsContent, TabsList, TabsTrigger } from "@devhop/ui";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { VariantDTO } from "../../domain/contracts/variant.contract";
import {
  useColorsQuery,
  useCreateVariant,
  useDeleteVariant,
  useProductQuery,
  useUpdateProduct,
  useUpdateVariant,
  useVariantsQuery,
} from "../api/queries";
import { ProductForm } from "../ui/ProductForm";
import { VariantForm } from "../ui/VariantForm";
import { VariantTable } from "../ui/VariantTable";

type VariantModal =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; variant: VariantDTO };

export function ProductDetailPage() {
  const { id } = useParams({ from: "/app/products/$id" });
  const nav = useNavigate();

  const product = useProductQuery(id);
  const variants = useVariantsQuery(id);
  const colors = useColorsQuery();
  const updateProduct = useUpdateProduct(id);
  const createVariant = useCreateVariant(id);
  const deleteVariant = useDeleteVariant(id);

  const [variantModal, setVariantModal] = useState<VariantModal>({ mode: "closed" });
  const editingVariantId =
    variantModal.mode === "edit" ? variantModal.variant.id : undefined;
  const updateVariant = useUpdateVariant(id, editingVariantId ?? "");

  const canEdit = useActionPermission(["products:update"]);

  if (product.isLoading) return <QueryState isLoading>{null}</QueryState>;
  if (!product.data)
    return <QueryState isError error="ບໍ່ພົບສິນຄ້າ">{null}</QueryState>;

  const p = product.data;

  async function handleUpdateProduct(
    values: {
      name: string;
      description?: string;
      basePrice: number;
      categoryId?: string;
      isActive: boolean;
      quantity: number;
    },
  ) {
    await updateProduct.mutateAsync({
      name: values.name,
      description: values.description ?? null,
      basePrice: values.basePrice,
      categoryId: values.categoryId || null,
      isActive: values.isActive,
      quantity: values.quantity,
    });
  }

  async function handleCreateVariant(values: {
    colorId: string;
    size?: string;
    sku?: string;
    price?: number | null;
    isActive: boolean;
  }) {
    await createVariant.mutateAsync({
      colorId: values.colorId,
      size: values.size,
      sku: values.sku,
      price: values.price,
      isActive: values.isActive,
    });
    setVariantModal({ mode: "closed" });
  }

  async function handleUpdateVariant(values: {
    colorId: string;
    size?: string;
    sku?: string;
    price?: number | null;
    isActive: boolean;
  }) {
    await updateVariant.mutateAsync({
      colorId: values.colorId,
      size: values.size,
      sku: values.sku,
      price: values.price,
      isActive: values.isActive,
    });
    setVariantModal({ mode: "closed" });
  }

  return (
    <>
      <Header />
      <Main>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav({ to: "/app/products" })}>
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            ກັບຄືນ
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{p.name}</h1>
            <p className="text-sm text-muted-foreground">{p.categoryName ?? "ບໍ່ມີໝວດໝູ່"}</p>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">ຂໍ້ມູນສິນຄ້າ</TabsTrigger>
            <TabsTrigger value="variants">
              Variant ({variants.data?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Product Info */}
          <TabsContent value="info">
            <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6">
              <ProductForm
                defaultValues={{
                  name: p.name,
                  description: p.description ?? "",
                  basePrice: Number(p.basePrice),
                  categoryId: p.categoryId ?? "",
                  isActive: p.isActive,
                  quantity: p.quantity,
                }}
                existingImageKeys={p.images.map((img) => img.url)}
                onSubmit={handleUpdateProduct}
                isLoading={updateProduct.isPending}
                submitLabel="ບັນທຶກການແກ້ໄຂ"
              />
            </div>
          </TabsContent>

          {/* Tab 2: Variants */}
          <TabsContent value="variants">
            <div className="rounded-xl border bg-card">
              {/* Variants toolbar */}
              {canEdit && (
                <div className="flex justify-end p-4">
                  <Button
                    size="sm"
                    onClick={() => setVariantModal({ mode: "create" })}
                  >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    ເພີ່ມ Variant
                  </Button>
                </div>
              )}

              <VariantTable
                data={variants.data ?? []}
                isLoading={variants.isLoading}
                basePrice={p.basePrice}
                onEdit={(v) => setVariantModal({ mode: "edit", variant: v })}
                onDelete={(variantId) => deleteVariant.run(variantId)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      {/* Create Variant Modal */}
      <Modal
        open={variantModal.mode === "create"}
        onOpenChange={(open) => !open && setVariantModal({ mode: "closed" })}
        title="ເພີ່ມ Variant ໃໝ່"
      >
        <VariantForm
          colors={colors.data ?? []}
          onSubmit={handleCreateVariant}
          isLoading={createVariant.isPending}
          submitLabel="ເພີ່ມ Variant"
        />
      </Modal>

      {/* Edit Variant Modal */}
      <Modal
        open={variantModal.mode === "edit"}
        onOpenChange={(open) => !open && setVariantModal({ mode: "closed" })}
        title="ແກ້ໄຂ Variant"
      >
        {variantModal.mode === "edit" && (
          <VariantForm
            colors={colors.data ?? []}
            defaultValues={{
              // ไม่ส่ง "" ให้ Select — ถ้า colorId null/undefined ให้ VariantForm ใช้ undefined
              colorId: variantModal.variant.colorId ?? undefined,
              size: variantModal.variant.size ?? "",
              sku: variantModal.variant.sku ?? "",
              price: variantModal.variant.price
                ? Number(variantModal.variant.price)
                : null,
              isActive: variantModal.variant.isActive,
            }}
            onSubmit={handleUpdateVariant}
            isLoading={updateVariant.isPending}
            submitLabel="ບັນທຶກການແກ້ໄຂ"
          />
        )}
      </Modal>
    </>
  );
}
