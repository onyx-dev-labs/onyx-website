import { getSiteConfig } from "@/actions/cms";
import { CmsEditor } from "@/components/admin/cms-editor";

export default async function CmsPage() {
  const config = await getSiteConfig();
  return <CmsEditor initialConfig={config || []} />;
}
