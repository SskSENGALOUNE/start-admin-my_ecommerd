import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { Button, Modal } from "@devhop/ui";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { CategoryDTO } from "../../domain/contracts/category.contract";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useCategoriesQuery,
} from "../api/queries";
import { CategoryForm } from "../ui/CategoryForm";
import { CategoryTable } from "../ui/CategoryTable";

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; category: CategoryDTO };

export function CategoriesPage() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const list = useCategoriesQuery();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const editingId =
    modal.mode === "edit" ? modal.category.id : undefined;
  const updateMutation = useUpdateCategory(editingId ?? "");

  const canCreate = useActionPermission(["categories:create"]);

  function closeModal() {
    setModal({ mode: "closed" });
  }

  async function handleCreate(values: { name: string }) {
    await createMutation.mutateAsync(values);
    closeModal();
  }

  async function handleUpdate(values: { name: string }) {
    await updateMutation.mutateAsync(values);
    closeModal();
  }

  const isOpen = modal.mode !== "closed";

  return (
    <>
      <Header />

      <Main>
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">ໝວດໝູ່ສິນຄ້າ</h1>
            <p className="text-sm text-muted-foreground">
              ຈັດການໝວດໝູ່ສິນຄ້າທັງໝົດ
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setModal({ mode: "create" })}>
              <PlusIcon className="mr-2 h-4 w-4" />
              ເພີ່ມໝວດໝູ່
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card">
          <CategoryTable
            data={list.data?.data ?? []}
            isLoading={list.isLoading}
            totalCount={list.data?.meta?.total ?? 0}
            offset={offset}
            limit={limit}
            onPaginationChange={(o, l) => {
              setOffset(o);
              setLimit(l);
            }}
            onEdit={(category) => setModal({ mode: "edit", category })}
            onDelete={(id) => deleteMutation.run(id)}
          />
        </div>
      </Main>

      {/* Create Modal */}
      <Modal
        open={isOpen && modal.mode === "create"}
        onOpenChange={(open) => !open && closeModal()}
        title="ເພີ່ມໝວດໝູ່ໃໝ່"
      >
        <CategoryForm
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          submitLabel="ສ້າງໝວດໝູ່"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={isOpen && modal.mode === "edit"}
        onOpenChange={(open) => !open && closeModal()}
        title="ແກ້ໄຂໝວດໝູ່"
      >
        {modal.mode === "edit" && (
          <CategoryForm
            defaultValues={{ name: modal.category.name }}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            submitLabel="ບັນທຶກການແກ້ໄຂ"
          />
        )}
      </Modal>
    </>
  );
}
