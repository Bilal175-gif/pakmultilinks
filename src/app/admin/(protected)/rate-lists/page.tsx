import { RateListsManager } from "../../_components/rate-lists-manager";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { isDatabaseConfigured } from "@/lib/db";
import { listAllRateListFiles } from "@/lib/rate-lists-server";

export const metadata = {
  title: "Rate Lists & Files — Pak Multilinks Admin",
};

export default async function RateListsAdminPage() {
  const connected = isDatabaseConfigured;
  const files = await listAllRateListFiles();

  return (
    <>
      <PageHeading
        eyebrow="Catalogue & Distribution"
        title="Wholesale Rate Lists & Files"
        description="Upload, preview, organize, and publish official PDF rate lists and company catalogues for wholesale buyers and corporate clients across Pakistan."
      />
      {!connected && <DemoNotice />}
      <RateListsManager initialFiles={files} disabled={!connected} />
    </>
  );
}
