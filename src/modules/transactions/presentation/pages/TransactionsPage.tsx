import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@devhop/ui";
import { useState } from "react";
import type { TransactionDetail, TransactionListItem } from "../api/client";
import {
  useManualConfirm,
  useTransactionQuery,
  useTransactionsQuery,
} from "../api/queries";

type StatusFilter = "ALL" | "PENDING" | "COMPLETED" | "FAILED";
type PaymentMethodFilter = "ALL" | "QR" | "COD";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "ທຸກສະຖານະ" },
  { value: "PENDING", label: "ລໍຖ້າ" },
  { value: "COMPLETED", label: "ສຳເລັດ" },
  { value: "FAILED", label: "ລົ້ມເຫຼວ" },
];

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethodFilter; label: string }[] =
  [
    { value: "ALL", label: "ທຸກວິທີ" },
    { value: "QR", label: "QR" },
    { value: "COD", label: "COD" },
  ];

function statusBadge(status: TransactionListItem["status"]) {
  if (status === "COMPLETED")
    return <Badge variant="success">ສຳເລັດ</Badge>;
  if (status === "FAILED")
    return <Badge variant="destructive">ລົ້ມເຫຼວ</Badge>;
  return <Badge variant="warning">ລໍຖ້າ</Badge>;
}

function paymentMethodBadge(method: TransactionListItem["paymentMethod"]) {
  if (method === "QR")
    return (
      <Badge variant="outline" className="border-blue-500 text-blue-600">
        QR
      </Badge>
    );
  return <Badge variant="secondary">COD</Badge>;
}

function formatKip(amount: string) {
  const num = Number(amount);
  return `${num.toLocaleString("lo-LA")} ກີບ`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("lo-LA");
}

function DetailDialog({
  id,
  open,
  onClose,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useTransactionQuery(id);
  const confirmMutation = useManualConfirm();

  function handleConfirm(detail: TransactionDetail) {
    confirmMutation.mutate(detail.orderRef, {
      onSuccess: () => onClose(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ລາຍລະອຽດການໂອນເງິນ</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground py-4">ກຳລັງໂຫຼດ...</p>
        )}

        {data && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">ລະຫັດການໂອນ</p>
                <p className="font-medium">{data.transactionId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ເລກທີຄຳສັ່ງ</p>
                <p className="font-medium">{data.orderNumber ?? "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ລູກຄ້າ</p>
                <p className="font-medium">{data.customerName ?? "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ຈຳນວນ</p>
                <p className="font-medium">{formatKip(data.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ສະຖານະ</p>
                <div className="mt-0.5">{statusBadge(data.status)}</div>
              </div>
              <div>
                <p className="text-muted-foreground">ວິທີຊຳລະ</p>
                <div className="mt-0.5">{paymentMethodBadge(data.paymentMethod)}</div>
              </div>
              <div>
                <p className="text-muted-foreground">ທະນາຄານ</p>
                <p className="font-medium">{data.bankType ?? "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ຮ້ານ (Merchant)</p>
                <p className="font-medium">{data.merchantName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Merchant ID</p>
                <p className="font-medium">{data.merchantId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ຢືນຢັນໂດຍ</p>
                <p className="font-medium">{data.verifiedBy ?? "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ວັນທີຢືນຢັນ</p>
                <p className="font-medium">{formatDate(data.verifiedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ວັນທີສ້າງ</p>
                <p className="font-medium">{formatDate(data.createdAt)}</p>
              </div>
            </div>

            {data.slipUrl && (
              <div>
                <p className="text-muted-foreground mb-1">ສລິບການໂອນ</p>
                <img
                  src={data.slipUrl}
                  alt="slip"
                  className="max-w-xs rounded border"
                />
              </div>
            )}

            {data.bankRequest && (
              <div>
                <p className="text-muted-foreground mb-1">Bank Request</p>
                <pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
                  {data.bankRequest}
                </pre>
              </div>
            )}

            {data.bankResponse && (
              <div>
                <p className="text-muted-foreground mb-1">Bank Response</p>
                <pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
                  {data.bankResponse}
                </pre>
              </div>
            )}

            {data.postRequest && (
              <div>
                <p className="text-muted-foreground mb-1">Post Request</p>
                <pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
                  {data.postRequest}
                </pre>
              </div>
            )}

            {data.status === "PENDING" && data.paymentMethod === "QR" && (
              <div className="pt-2">
                <Button
                  onClick={() => handleConfirm(data)}
                  disabled={confirmMutation.isPending}
                >
                  {confirmMutation.isPending ? "ກຳລັງດຳເນີນ..." : "ຢືນຢັນດ້ວຍມື"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TransactionsPage() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<PaymentMethodFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useTransactionsQuery({
    offset,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    paymentMethod:
      paymentMethodFilter === "ALL" ? undefined : paymentMethodFilter,
  });

  const total = list.data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  function handleStatusChange(val: string) {
    setStatusFilter(val as StatusFilter);
    setOffset(0);
  }

  function handlePaymentMethodChange(val: string) {
    setPaymentMethodFilter(val as PaymentMethodFilter);
    setOffset(0);
  }

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">ລາຍການໂອນເງິນ</h1>
            <p className="text-sm text-muted-foreground">
              ກວດສອບ ແລະ ຈັດການລາຍການຊຳລະເງິນ
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="ທຸກສະຖານະ" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={paymentMethodFilter}
            onValueChange={handlePaymentMethodChange}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="ທຸກວິທີ" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">ເລກທີຄຳສັ່ງ</th>
                <th className="px-4 py-3 font-medium">ລູກຄ້າ</th>
                <th className="px-4 py-3 font-medium">ຈຳນວນ</th>
                <th className="px-4 py-3 font-medium">ວິທີຊຳລະ</th>
                <th className="px-4 py-3 font-medium">ທະນາຄານ</th>
                <th className="px-4 py-3 font-medium">ສະຖານະ</th>
                <th className="px-4 py-3 font-medium">ວັນທີ</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    ກຳລັງໂຫຼດ...
                  </td>
                </tr>
              )}
              {!list.isLoading && (list.data?.data ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    ບໍ່ມີຂໍ້ມູນ
                  </td>
                </tr>
              )}
              {(list.data?.data ?? []).map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => setSelectedId(row.id)}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {offset + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {row.orderNumber ?? "-"}
                  </td>
                  <td className="px-4 py-3">{row.customerName ?? "-"}</td>
                  <td className="px-4 py-3">{formatKip(row.amount)}</td>
                  <td className="px-4 py-3">
                    {paymentMethodBadge(row.paymentMethod)}
                  </td>
                  <td className="px-4 py-3">{row.bankType ?? "-"}</td>
                  <td className="px-4 py-3">{statusBadge(row.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              ທັງໝົດ {total} ລາຍການ
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                ກ່ອນໜ້າ
              </Button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setOffset(offset + limit)}
              >
                ຕໍ່ໄປ
              </Button>
            </div>
          </div>
        )}
      </Main>

      {selectedId && (
        <DetailDialog
          id={selectedId}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
