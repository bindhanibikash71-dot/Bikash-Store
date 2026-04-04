export type ProductType = "video" | "app" | "link" | "file";

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: "user" | "admin";
  createdAt: any;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ProductType;
  thumbnail: string;
  contentUrl: string;
  createdAt: any;
}

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  paymentId: string;
  status: "success" | "failed";
  amount: number;
  createdAt: any;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: "weekly" | "monthly" | "yearly";
  status: "active" | "expired";
  startDate: any;
  endDate: any;
  paymentId: string;
  amount: number;
}
