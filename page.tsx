import { getContent } from "@/lib/db";
import HelloWorld from "@/components/ui/HelloWorld";
import type { SiteContent } from "@/lib/types";

export default function HomePage() {
  const content: SiteContent = getContent();
  return <HelloWorld content={content.home} />;
}
