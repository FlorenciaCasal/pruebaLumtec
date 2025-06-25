export type PreferenceRequest = {
  items: Array<{
    id?: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
    picture_url?: string;
  }>;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: "approved";
  notification_url?: string;
};
