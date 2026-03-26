import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOCS_PAGE_URL } from "@/lib/docs-url";
import { TitleSEO } from "@/components/titleSEO/title-SEO";

export default function DocumentationPage() {
  return (
    <div className="max-w-xl space-y-6">
      <TitleSEO
        title="Клиенты"
        description="Полная документация проекта — в репозитории на GitHub."
        canonical="/documentation"
      />
      <Button asChild>
        <a
          href={DOCS_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Открыть API Docs
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
