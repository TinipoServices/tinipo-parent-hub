import type { Category, Product } from "../types";

const cat = (id: string, name: string, image: string): Category => ({ id, name, image });

function pr(
  id: string,
  name: string,
  baseImage: string,
  category_id: string,
  baseMrp: number,
  description: string,
  extraImages: string[],
): Product {
  const images = [baseImage, ...extraImages];
  return {
    id,
    name,
    image: baseImage,
    images,
    description,
    category_id,
    mrp_amount: baseMrp,
    is_active: true,
  };
}

export const DUMMY_CATEGORIES: Category[] = [
  cat("c-baby", "Baby Care", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80&auto=format&fit=crop"),
  cat("c-feed", "Feeding", "https://images.unsplash.com/photo-1627856014751-25172f6b1d22?w=600&q=80&auto=format&fit=crop"),
  cat("c-learn", "Learning", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80&auto=format&fit=crop"),
  cat("c-safe", "Safety", "https://images.unsplash.com/photo-1584515933487-779824d29331?w=600&q=80&auto=format&fit=crop"),
  cat("c-toys", "Toys", "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80&auto=format&fit=crop"),
];

export const DUMMY_PRODUCTS: Product[] = [
  pr(
    "p-1",
    "Alphabet Blocks Set",
    "https://images.unsplash.com/photo-1587654780294-73cf91fb2168?w=800&q=80&auto=format&fit=crop",
    "c-learn",
    899,
    "Bright wooden blocks with letters and numbers to support early literacy and fine motor skills. Non-toxic paint, smooth edges, and a sturdy storage tray. Suitable for ages 18 months and up.",
    [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-2",
    "Baby Carrier Wrap",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80&auto=format&fit=crop",
    "c-baby",
    2499,
    "Ergonomic wrap-style carrier that distributes weight evenly. Breathable fabric for Indian weather, machine washable, and suitable for newborns up to 12 kg.",
    [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-3",
    "Bamboo Feeding Bowl",
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80&auto=format&fit=crop",
    "c-feed",
    449,
    "Natural bamboo bowl with silicone suction base to prevent spills. BPA-free, easy to clean, and sized for toddler portions.",
    [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615485925601-ef78e6d55a60?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-4",
    "Board Book Bundle",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80&auto=format&fit=crop",
    "c-learn",
    599,
    "Set of 6 thick-paged board books with high-contrast illustrations. Rip-resistant pages, rounded corners, perfect for bedtime reading.",
    [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-5",
    "Corner Guards Pack",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80&auto=format&fit=crop",
    "c-safe",
    349,
    "Soft foam corner protectors with strong adhesive. Blends with furniture, protects toddlers from sharp edges—8 pieces per pack.",
    [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-6",
    "Cotton Bibs (5 pc)",
    "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800&q=80&auto=format&fit=crop",
    "c-feed",
    399,
    "Super-absorbent cotton bibs with adjustable snaps. Fun prints, stays soft after washing—ideal for messy meals.",
    [
      "https://images.unsplash.com/photo-1627856014751-25172f6b1d22?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-7",
    "Musical Teether",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80&auto=format&fit=crop",
    "c-toys",
    299,
    "Food-grade silicone teether with gentle rattle sounds. Freezer-safe for sore gums, easy for little hands to grip.",
    [
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-8",
    "Night Lamp Soft Glow",
    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80&auto=format&fit=crop",
    "c-safe",
    1299,
    "Warm LED night lamp with dimmer and timer. Cool to touch, plug-in with child-safe design for nurseries.",
    [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-9",
    "Organic Cotton Onesie",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80&auto=format&fit=crop",
    "c-baby",
    799,
    "GOTS-certified organic cotton onesie with envelope neckline and snap closure. Gentle on sensitive skin.",
    [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-10",
    "Plush Bunny",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop",
    "c-toys",
    699,
    "Ultra-soft plush bunny with embroidered eyes (no small parts). Machine washable, huggable size for toddlers.",
    [
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-11",
    "Silicone Spoon Set",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80&auto=format&fit=crop",
    "c-feed",
    279,
    "Flexible silicone spoons designed for first bites. Gentle on gums, dishwasher safe—set of 3 colours.",
    [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80&auto=format&fit=crop",
    ],
  ),
  pr(
    "p-12",
    "Soft Play Mat",
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format&fit=crop",
    "c-toys",
    1899,
    "Foldable XPE foam play mat with reversible patterns. Waterproof, non-slip, and easy to wipe clean for tummy time and play.",
    [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format&fit=crop",
    ],
  ),
];

/** Mock city-wise price tweak so pincode visibly changes amounts in preview mode. */
export function applyMockPincodeToProduct(p: Product, pincode: string): Product {
  const digits = pincode.replace(/\D/g, "");
  if (digits.length < 6) return p;
  const seed = parseInt(digits.slice(-3), 10) % 50;
  const delta = seed - 25;
  const mrp = Math.max(1, Math.round(p.mrp_amount + delta));
  return { ...p, mrp_amount: mrp };
}

export function getDummyProductById(id: string): Product | undefined {
  return DUMMY_PRODUCTS.find((p) => p.id === id);
}

export function sortedCategories(list: Category[]): Category[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function sortedProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
