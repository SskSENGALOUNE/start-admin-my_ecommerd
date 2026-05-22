import { Button, FormInput, FormRoot, RHF, zodResolver } from "@devhop/ui";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "ກະລຸນາໃສ່ຊື່ໝວດໝູ່"),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: { name: string };
  onSubmit: (values: { name: string }) => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function CategoryForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "ບັນທຶກ",
}: Props) {
  const methods = RHF.useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultValues?.name ?? "" },
  });

  return (
    <FormRoot methods={methods} onSubmit={onSubmit} className="space-y-4">
      <FormInput
        name="name"
        label="ຊື່ໝວດໝູ່"
        requiredMark
        placeholder="ເຊັ່ນ: ເສື້ອຜ້າ, ເກີບ, ກະເປົ໋າ"
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "ກຳລັງບັນທຶກ..." : submitLabel}
        </Button>
      </div>
    </FormRoot>
  );
}
