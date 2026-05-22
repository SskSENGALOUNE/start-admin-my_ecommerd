import {
  Button,
  FormCheckbox,
  FormInput,
  FormPassword,
  FormRoot,
  Loader,
  RHF,
  toast,
  zodResolver,
} from "@devhop/ui";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { authClient } from "../api/client";
import { useAuthState } from "../model/useAuthState";

const SignInFormSchema = z.object({
  email: z.email({ error: "ອີເມວບໍ່ຖືກຕ້ອງ" }),
  password: z.string().min(6, { message: "ລະຫັດຜ່ານຕ້ອງຢ່າງນ້ອຍ 8 ຕົວອັກສອນ" }),
  rememberMe: z.boolean().optional(),
});

type ISignInFormSchema = z.infer<typeof SignInFormSchema>;

const DEV_ACCOUNTS = [
  { label: "Admin", email: "admin@admin.com", password: "123456", color: "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20" },
];

const isDev = import.meta.env.DEV;

export default function SignInForm() {
  const navigate = useNavigate({ from: "/" });
  const { isLoading } = useAuthState();

  const form = RHF.useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(SignInFormSchema),
  });

  const handleSubmit = async (value: ISignInFormSchema) => {
    await authClient.signIn.email(
      { email: value.email, password: value.password },
      {
        onSuccess: () => {
          navigate({ to: "/app/dashboard" });
          toast.success("ເຂົ້າລະບົບສໍາເລັດ");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      },
    );
  };

  const handleQuickLogin = async (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: "/app/dashboard" });
          toast.success("ເຂົ້າລະບົບສໍາເລັດ");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      },
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4">
      <FormRoot<ISignInFormSchema> methods={form} onSubmit={handleSubmit}>
        <FormInput
          name="email"
          label="ອີເມວ"
          requiredMark
          placeholder="name@example.com"
        />
        <FormPassword
          name="password"
          label="ລະຫັດຜ່ານ"
          requiredMark
          placeholder="********"
        />

        <FormCheckbox name="rememberMe" label="ຈໍາຂ້ອຍໄວ້" />

        <Button type="submit" isLoading={isLoading} className="w-full">
          ເຂົ້າລະບົບ
        </Button>
      </FormRoot>

      {isDev && (
        <div className="rounded-lg border border-dashed border-yellow-500/30 bg-yellow-500/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-yellow-500/70">
            <span>⚡</span>
            <span>Quick Login (Dev Only)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {DEV_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleQuickLogin(account.email, account.password)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${account.color}`}
              >
                {account.label}
                <span className="ml-1.5 opacity-50">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
