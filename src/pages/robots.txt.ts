import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	const body = `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', site).href}\n`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};