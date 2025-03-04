import { Helmet } from 'react-helmet';

interface SEOProps {
    title: string;
    description?: string;
    path?: string;
}

export function SEO({ title, description, path }: SEOProps) {
    const baseUrl = window.location.origin;
    const currentUrl = path ? `${baseUrl}${path}` : window.location.href;
    const ogImage = `${baseUrl}/og-bg.png`;
    const defaultDescription = "Muse - Your Personal Music Dashboard";

    return (
        <Helmet>
            <title>{title} | Muse</title>
            <meta name="description" content={description || defaultDescription} />

            <meta property="og:title" content={`${title} | Muse`} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:alt" content={title} />
            <meta property="og:site_name" content="Muse" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${title} | Muse`} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
}
