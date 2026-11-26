import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";
import { can } from "@/lib/admin/roles";
import { isStorageConfigured } from "@/lib/admin/storage";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { ASSISTANT_MODELS, assistantModelOf, usageCostUsd, type AssistantModel } from "@/lib/assistant/config";
import { getConversation, listConversations, monthUsage } from "@/lib/assistant/store";
import { chatView } from "@/lib/assistant/view";
import { AssistantChat } from "@/components/admin/assistant/AssistantChat";
import { Card, EmptyState, Notice, PageHeader, buttonClass, linkClass, timeAgo } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const generateMetadata = () => adminTitle("AI yordamchi");
export const dynamic = "force-dynamic";

export default async function AdminAssistantPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const settings = await getRuntimeIntegrationSettings();
  const model = assistantModelOf(settings.assistant.model);
  const modelLabel = ASSISTANT_MODELS.find((m) => m.id === model)?.id ?? model;

  if (!settings.assistant.apiKey) {
    return (
      <>
        <PageHeader title={t("AI yordamchi")} />
        <Card>
          <EmptyState
            title={t("Yordamchi hali ulanmagan")}
            action={can(admin.role, "integrations") ? <Link href="/admin/integrations#assistant" className={buttonClass}>{t("API kalitini kiritish")}</Link> : undefined}
          >
            {can(admin.role, "integrations")
              ? t("console.anthropic.com da API kaliti oling va Integratsiyalar sahifasidagi «AI yordamchi» boʻlimiga kiriting.")
              : t("Egasidan Integratsiyalar sahifasida Anthropic API kalitini kiritishni soʻrang.")}
          </EmptyState>
        </Card>
      </>
    );
  }

  const id = Number(params.c);
  const [conversation, list, usage] = await Promise.all([
    Number.isInteger(id) && id > 0 ? getConversation(admin.id, id) : null,
    listConversations(admin.id),
    monthUsage(),
  ]);
  const spent = Object.entries(usage).reduce((sum, [m, u]) => sum + usageCostUsd(assistantModelOf(m) as AssistantModel, u), 0);

  const examples = [
    can(admin.role, "orders") && t("Bugun nechta buyurtma tushdi va qaysilari hali tasdiqlanmagan?"),
    can(admin.role, "orders") && t("Oxirgi 30 kunda eng koʻp sotilgan 5 ta mahsulot"),
    can(admin.role, "marketing") && t("Yangi yil uchun 15% lik promokod och, 31-dekabrgacha, 300 000 soʻmdan"),
    can(admin.role, "catalog") && t("Rasmdagi mahsulotni katalogga qoʻsh, narxi 189 000 soʻm"),
    can(admin.role, "analytics") && t("Qaysi vitaminlarga talab bor, lekin bizda yoʻq?"),
  ].filter((x): x is string => Boolean(x));

  return (
    <>
      <PageHeader
        title={t("AI yordamchi")}
        lead={t("Savol bering yoki ish buyuring: buyurtmalar, mahsulotlar, promokodlar, savdo. Oʻzgartiradigan har amalni oldin siz tasdiqlaysiz.")}
        actions={<Link href="/admin/assistant" className={buttonClass}>{t("Yangi suhbat")}</Link>}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <AssistantChat
          key={conversation?.id ?? "new"}
          initialId={conversation?.id ?? null}
          initialItems={conversation ? chatView(conversation.messages) : []}
          initialPending={conversation?.pending ? { name: conversation.pending.name, preview: conversation.pending.preview } : null}
          canUpload={can(admin.role, "catalog") && isStorageConfigured}
          examples={examples}
        />
        <aside className="flex flex-col gap-4">
          <Card title={t("Suhbatlar")}>
            {list.length === 0 ? (
              <p className="text-[14px] text-muted">{t("Hali suhbat yoʻq.")}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {list.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/assistant?c=${c.id}`}
                      className={cn("flex min-h-11 flex-col justify-center rounded-[12px] px-3 py-2 hover:bg-tile", c.id === conversation?.id && "bg-tile")}
                    >
                      <span className="truncate text-[14px] font-semibold text-ink">{c.title || t("Suhbat")}</span>
                      <span className="text-[12px] text-muted">{timeAgo(c.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t("Sarf")}>
            <p className="text-[14px] leading-6 text-ink-2">
              {t("Model: {model}", { model: modelLabel })}
              <br />
              {t("Bu oy faol suhbatlar: ≈ ${usd}", { usd: spent.toFixed(2) })}
            </p>
            {can(admin.role, "integrations") && (
              <p className="mt-2 text-[13px]">
                <Link href="/admin/integrations#assistant" className={linkClass}>{t("Modelni oʻzgartirish")}</Link>
              </p>
            )}
          </Card>
          {conversation === null && Number.isInteger(id) && id > 0 && <Notice tone="error">{t("Suhbat topilmadi.")}</Notice>}
        </aside>
      </div>
    </>
  );
}
