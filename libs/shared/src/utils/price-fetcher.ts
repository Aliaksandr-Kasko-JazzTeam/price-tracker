import * as cheerio from 'cheerio';

export function extractPriceFromHtml(html: string): number {
  const $ = cheerio.load(html);
  const saleSelector = '.price-item.sale';
  const priceElement = $(saleSelector).length ? $(saleSelector) : $('.price-item');
  const priceMatch = priceElement
    ?.first()?.text()?.replace(/,/g, '')?.match(/\$(\d+(?:\.\d+)?)\s*/) ?? ['', ''];
  const price = parseFloat(priceMatch[1]);
  return isNaN(price) ? -1 : price;
}
