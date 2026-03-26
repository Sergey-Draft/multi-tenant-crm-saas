import Head from "next/head";

interface PageHeaderProps {
  title: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  className?: string;
}

const defaultSEO = {
  siteUrl: "https://yourdomain.com",
  ogImage: "/og-image.jpg", 
};

export function TitleSEO({
  title,
  description,
  canonical,
  noIndex,
}: PageHeaderProps) {
  const seoTitle = title.includes("CRM Platform")
    ? title
    : `${title} | CRM Platform`;

  const seoDescription =
    description || `Manage your business with CRM Platform. ${title}`;

  const pageUrl = canonical?.startsWith("http")
    ? canonical
    : `${defaultSEO.siteUrl}${canonical || ""}`;

  const ogImageUrl = `${defaultSEO.siteUrl}${defaultSEO.ogImage}`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />

        {noIndex && <meta name="robots" content="noindex, nofollow" />}

        <link rel="canonical" href={pageUrl} />

        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CRM Platform" />
        <meta property="og:image" content={ogImageUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>

      {description && (
        <p className="text-base text-muted-foreground mt-0.5">
          {description}
        </p>
      )}
    </>
  );
}