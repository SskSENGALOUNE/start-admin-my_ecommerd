import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@devhop/ui";
import { customerAuthApi } from "../api/client";
import type { LoginDTO, RegisterDTO } from "../../domain/contracts/customer-auth.contract";

export const customerAuthKeys = {
  me: ["customer-auth", "me"] as const,
};

/** ดึง session ลูกค้าปัจจุบัน — ไม่ throw ถ้าไม่ได้ login */
export function useCustomerSession() {
  return useQuery({
    queryKey: customerAuthKeys.me,
    queryFn: () => customerAuthApi.me(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useCustomerRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterDTO) => customerAuthApi.register(input),
    onSuccess: () => {
      toast.success("ສ້າງບັນຊີສຳເລັດ! ຍິນດີຕ້ອນຮັບ 🎉");
      qc.invalidateQueries({ queryKey: customerAuthKeys.me });
    },
    onError: () => toast.error("ສ້າງບັນຊີລົ້ມເຫຼວ"),
  });
}

export function useCustomerLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginDTO) => customerAuthApi.login(input),
    onSuccess: () => {
      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ");
      qc.invalidateQueries({ queryKey: customerAuthKeys.me });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => toast.error("ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"),
  });
}

export function useCustomerLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customerAuthApi.logout(),
    onSuccess: () => {
      toast.success("ອອກຈາກລະບົບແລ້ວ");
      qc.setQueryData(customerAuthKeys.me, null);
      qc.removeQueries({ queryKey: ["cart"] });
    },
  });
}
