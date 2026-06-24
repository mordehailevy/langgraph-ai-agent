import { tool } from "@langchain/core/tools";
const getProducts = tool(
  async () => {
    const result = await fetch("https://dummyjson.com/products");
    const data: any = await result.json()
    const products = data.products.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    }));
    return { products };
  },
  {
    name: "getProducts",
    description: "Get a list of products.",
  }
);
 
export default getProducts;