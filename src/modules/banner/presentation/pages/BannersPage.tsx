import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { Button, Modal } from "@devhop/ui";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { BannerDTO } from "../../domain/contracts/banner.contract";
import type { CreateBannerDTO, UpdateBannerDTO } from "../../domain/contracts/banner.contract";
import {
  useBannersQuery,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "../api/queries";
import { BannerForm } from "../ui/BannerForm";
import { BannerTable } from "../ui/BannerTable";

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; banner: BannerDTO };

export function BannersPage() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const list = useBannersQuery();
  const createMutation = useCreateBanner();
  const deleteMutation = useDeleteBanner();

  const editingId = modal.mode === "edit" ? modal.banner.id : undefined;
  const updateMutation = useUpdateBanner(editingId ?? "");

  const canCreate = useActionPermission(["banners:create"]);

  function closeModal() {
    setModal({ mode: "closed" });
  }

  async function handleCreate(values: CreateBannerDTO) {
    await createMutation.mutateAsync(values);
    closeModal();
  }

  async function handleUpdate(values: UpdateBannerDTO) {
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
            <h1 className="text-xl font-semibold">Banner</h1>
            <p className="text-sm text-muted-foreground">
              ຈັດການ Slide Banner ໜ້າຫຼັກ
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setModal({ mode: "create" })}>
              <PlusIcon className="mr-2 h-4 w-4" />
              ເພີ່ມ Banner
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card">
          <BannerTable
            data={list.data?.data ?? []}
            isLoading={list.isLoading}
            totalCount={list.data?.meta?.total ?? 0}
            offset={offset}
            limit={limit}
            onPaginationChange={(o, l) => {
              setOffset(o);
              setLimit(l);
            }}
            onEdit={(banner) => setModal({ mode: "edit", banner })}
            onDelete={(id) => deleteMutation.run(id)}
          />
        </div>
      </Main>

      {/* Create Modal */}
      <Modal
        open={isOpen && modal.mode === "create"}
        onOpenChange={(open) => !open && closeModal()}
        title="ເພີ່ມ Banner ໃໝ່"
      >
        <BannerForm
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          submitLabel="ສ້າງ Banner"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={isOpen && modal.mode === "edit"}
        onOpenChange={(open) => !open && closeModal()}
        title="ແກ້ໄຂ Banner"
      >
        {modal.mode === "edit" && (
          <BannerForm
            defaultValues={{
              title: modal.banner.title,
              imageUrl: modal.banner.imageUrl,
              linkUrl: modal.banner.linkUrl ?? "",
              isActive: modal.banner.isActive,
              order: modal.banner.order,
            }}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            submitLabel="ບັນທຶກການແກ້ໄຂ"
          />
        )}
      </Modal>
    </>
  );
}
