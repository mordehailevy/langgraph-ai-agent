import { tool } from "@langchain/core/tools";

type Product = { id: number; title: string; description: string; price: number };

const getProducts = tool(
  async () => {
    try {
      const response = await fetch("https://dummyjson.com/products");
      if (!response.ok) {
        return `Could not load products (HTTP ${response.status}).`;
      }
      const data = (await response.json()) as { products?: Product[] };
      const products = (data.products ?? []).map(({ id, title, description, price }) => ({
        id,
        title,
        description,
        price,
      }));
      return JSON.stringify({ products });
    } catch {
      return "Could not reach the product catalog.";
    }
  },
  {
    name: "getProducts",
    description: "Get the product catalog (id, title, description and price of each product).",
  },
);

export default getProducts;
