import Highlights from "@/components/lightning/Highlights";
import StagePath from "@/components/lightning/StagePath";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: { account: true, owner: true, contact: true, aircraft: true },
  });

  if (!opp) {
    notFound();
  }

  const currency = opp.currency ?? "USD";
  const amount =
    typeof opp.amount === "number"
      ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(opp.amount))
      : opp.amount
      ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(opp.amount.toString()))
      : "—";

  return (
    <div className="space-y-4 p-4">
      <Highlights
        title={opp.name}
        subtitle={opp.account?.name}
        items={[
          { label: "Amount", value: amount },
          { label: "Owner", value: opp.owner?.name ?? "—" },
          { label: "Close Date", value: opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : "—" },
          { label: "Probability", value: `${opp.probability ?? 0}%` },
        ]}
      />
      <StagePath
        id={opp.id}
        current={opp.stage}
        stages={["PROSPECT", "QUALIFY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]}
      />

      {/* Details Section */}
      <div className="rounded-xl border bg-background">
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Details</h2>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="text-sm">
            <div className="text-muted-foreground">Account</div>
            <div className="font-medium">{opp.account?.name ?? "—"}</div>
          </div>
          <div className="text-sm">
            <div className="text-muted-foreground">Contact</div>
            <div className="font-medium">
              {opp.contact ? `${opp.contact.firstName} ${opp.contact.lastName}` : "—"}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-muted-foreground">Aircraft</div>
            <div className="font-medium">
              {opp.aircraft ? `${opp.aircraft.make} ${opp.aircraft.model} (${opp.aircraft.tailNumber})` : "—"}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-muted-foreground">Pipeline</div>
            <div className="font-medium">{opp.pipeline}</div>
          </div>
          {opp.description && (
            <div className="text-sm sm:col-span-2">
              <div className="text-muted-foreground">Description</div>
              <div className="font-medium">{opp.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
