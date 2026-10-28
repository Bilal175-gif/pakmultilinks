import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { QuotesTable, type AdminQuoteRow } from "../../_components/workflow-tables";

export default async function QuotesPage() {
  let connected = isDatabaseConfigured;
  let rows: AdminQuoteRow[] = [];
  if (connected) {
    try {
      const records = await withDatabaseRetry(() =>
        db.quoteRequest.findMany({
          take: 100,
          orderBy: { createdAt: "desc" },
          include: { items: true },
        }),
      );
      rows = records.map((quote) => ({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        customerName: quote.customerName,
        companyName: quote.companyName,
        email: quote.email,
        phone: quote.phone,
        city: quote.city,
        notes: quote.notes || "",
        adminNotes: quote.adminNotes || "",
        status: quote.status,
        createdAt: quote.createdAt.toISOString(),
        items: quote.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          details: item.details || "",
        })),
      }));
    } catch (err) {
      console.error("[QuotesPage] Database error:", err);
      connected = false;
    }
  }
  return (
    <>
      <PageHeading eyebrow="Corporate sales" title="Quotation requests" description="Track bulk requirements from first contact through quotation and outcome." />
      {!connected && <DemoNotice localRecords />}
      <QuotesTable initialRows={rows} connected={connected} />
    </>
  );
}

