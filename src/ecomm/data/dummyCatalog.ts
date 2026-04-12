import type { Category, Product } from "../types";

/** Placeholder imagery for layout preview until the catalog API is live. */
const cat = (id: string, name: string, image: string): Category => ({ id, name, image });

const pr = (
  id: string,
  name: string,
  image: string,
  category_id: string,
  mrp_amount: number,
): Product => ({
  id,
  name,
  image,
  category_id,
  mrp_amount,
  is_active: true,
});

export const DUMMY_CATEGORIES: Category[] = [
  cat("c-baby", "Baby Care", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80&auto=format&fit=crop"),
  cat("c-feed", "Feeding", "https://images.unsplash.com/photo-1627856014751-25172f6b1d22?w=600&q=80&auto=format&fit=crop"),
  cat("c-learn", "Learning", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80&auto=format&fit=crop"),
  cat("c-safe", "Safety", "https://images.unsplash.com/photo-1584515933487-779824d29331?w=600&q=80&auto=format&fit=crop"),
  cat("c-toys", "Toys", "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80&auto=format&fit=crop"),
];

export const DUMMY_PRODUCTS: Product[] = [
  pr("p-1", "Alphabet Blocks Set", "https://images.unsplash.com/photo-1587654780294-73cf91fb2168?w=400&q=80&auto=format&fit=crop", "c-learn", 899),
  pr("p-2", "Baby Carrier Wrap", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80&auto=format&fit=crop", "c-baby", 2499),
  pr("p-3", "Bamboo Feeding Bowl", "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80&auto=format&fit=crop", "c-feed", 449),
  pr("p-4", "Board Book Bundle", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80&auto=format&fit=crop", "c-learn", 599),
  pr("p-5", "Corner Guards Pack", "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80&auto=format&fit=crop", "c-safe", 349),
  pr("p-6", "Cotton Bibs (5 pc)", "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&q=80&auto=format&fit=crop", "c-feed", 399),
  pr("p-7", "Musical Teether", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80&auto=format&fit=crop", "c-toys", 299),
  pr("p-8", "Night Lamp Soft Glow", "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80&auto=format&fit=crop", "c-safe", 1299),
  pr("p-9", "Organic Cotton Onesie", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80&auto=format&fit=crop", "c-baby", 799),
  pr("p-10", "Plush Bunny", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop", "c-toys", 699),
  pr("p-11", "Silicone Spoon Set", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80&auto=format&fit=crop", "c-feed", 279),
  pr("p-12", "Soft Play Mat", "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80&auto=format&fit=crop", "c-toys", 1899),
];

export function sortedCategories(list: Category[]): Category[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function sortedProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
