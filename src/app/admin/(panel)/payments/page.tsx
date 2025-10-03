import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaymentsOverview, PaymentRecord } from "@/lib/server/payments";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date) {
  return date.toLocaleString();
}

function RecordsTable({ title, description, records }: { title: string; description: string; records: PaymentRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records available.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium">Reference</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{record.id}</span>
                      {record.description ? (
                        <span className="text-xs text-muted-foreground">{record.description}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(record.amount, record.currency)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{record.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{record.customer ?? "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(record.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminPaymentsPage() {
  const overview = await getPaymentsOverview();

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Review platform-wide payment activity and investigate customer billing events.
        </p>
      </header>
      <RecordsTable title="Transactions" description="Latest payment intents or subscription renewals." records={overview.transactions} />
      <RecordsTable title="Invoices" description="Recent invoices created for organizations." records={overview.invoices} />
      <RecordsTable title="Refunds" description="Refunds issued to customers." records={overview.refunds} />
    </div>
  );
}
