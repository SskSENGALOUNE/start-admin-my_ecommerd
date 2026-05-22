import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@devhop/ui";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateProduct } from "../api/queries";
import { ProductForm } from "../ui/ProductForm";

export function ProductCreatePage() {
  const nav = useNavigate();
  const create = useCreateProduct();

  async function handleSubmit(
    values: {
      name: string;
      description?: string;
      basePrice: number;
      categoryId?: string;
      isActive: boolean;
      quantity: number;
    },
    imageKeys: string[],
  ) {
    const product = await create.mutateAsync({
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      categoryId: values.categoryId || undefined,
      isActive: values.isActive,
      quantity: values.quantity,
      imageKeys,
    });
    nav({ to: "/app/products/$id", params: { id: product.id } });
  }

  return (
    <>
      <Header />
      <Main>
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => nav({ to: "/app/products" })}
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            ກັບຄືນ
          </Button>
          <div>
            <h1 className="text-xl font-semibold">ເພີ່ມສິນຄ້າໃໝ່</h1>
          </div>
        </div>

        <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6">
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={create.isPending}
            submitLabel="ສ້າງສິນຄ້າ"
          />
        </div>
      </Main>
    </>
  );
}
