export interface IPriceChangeNotification {
  subscribers: string[];
  productName: string;
  productUrl: string;
  currentPrice: number;
  previousPrice: number;
}
