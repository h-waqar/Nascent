import mongoose from "mongoose";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://nascentfragrances_db_user:rQpGRaeIkdRAJWh5@cluster0.wfkzei4.mongodb.net/nascent_dev?retryWrites=true&w=majority&appName=Cluster0";

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    scentNotes: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    categoryId: { type: String },
    hidden: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    collection: { type: String },
    intensity: { type: String, enum: ["Subtle", "Light", "Moderate", "Strong", "Intense"] },
    volume: { type: String },
    topNote: { type: String },
    heartNote: { type: String },
    baseNote: { type: String },
    rating: { type: Number, min: 0, max: 5, default: 5.0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: "Standard Chartered Bank" },
    accountName: { type: String, default: "Nascent Fragrances Studio" },
    accountNumber: { type: String, default: "01002345678" },
    iban: { type: String, default: "PK36SCBL0000001002345678" },
    whatsappNumber: { type: String, default: "923000000000" },
    shippingCost: { type: Number, default: 250 },
    codEnabled: { type: Boolean, default: true },
    bankTransferEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

const SAMPLE_PRODUCTS = [
  {
    slug: "phantom-elixir",
    name: "Phantom Elixir",
    description: "A dark, monolithic architectural fragrance opening with volatile crushed spices and drying into smoky cedar and obsidian resin.",
    price: 8500,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=1000",
    ],
    scentNotes: ["Woody", "Oriental"],
    isFeatured: true,
    collection: "MONOLITH SERIES // 001",
    intensity: "Intense",
    volume: "50ml Extrait de Parfum",
    topNote: "Cardamom, Bitter Pepper",
    heartNote: "French Lavender, Smoked Birch",
    baseNote: "Vetiver Roots, Raw Amber",
    rating: 4.8,
    ratingCount: 14,
    reviewCount: 3,
  },
  {
    slug: "cyphr",
    name: "Cyphr",
    description: "Cold geometric freshness. Sharp aldehydes and crisp juniper slicing through mineral ambergris and sterile cedarwood.",
    price: 7900,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
    ],
    scentNotes: ["Fresh", "Woody"],
    isFeatured: true,
    collection: "CLINICAL SERIES // 002",
    intensity: "Moderate",
    volume: "50ml Extrait de Parfum",
    topNote: "Crisp Juniper, Aldehydes",
    heartNote: "Frosted Cedar, Iso E Super",
    baseNote: "White Ambergris, Vetiver",
    rating: 4.1,
    ratingCount: 9,
    reviewCount: 2,
  },
  {
    slug: "velour-oud",
    name: "Velour Oud",
    description: "Austere ceremonial oud balanced with dark Turkish rose petals and dry black leather.",
    price: 9200,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000",
    ],
    scentNotes: ["Oriental", "Woody"],
    isFeatured: true,
    collection: "NOCTURNAL COLLECTION // 003",
    intensity: "Intense",
    volume: "50ml Extrait de Parfum",
    topNote: "Saffron, Dark Rose",
    heartNote: "Aged Cambodi Oud, Incense",
    baseNote: "Leather, Birch Tar, Labdanum",
    rating: 3.9,
    ratingCount: 18,
    reviewCount: 4,
  },
  {
    slug: "nocturne-amber",
    name: "Nocturne Amber",
    description: "Warm, slow-burning golden resins and tonka bean enveloped in quiet vanilla and benzoin.",
    price: 8000,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000",
    ],
    scentNotes: ["Oriental", "Floral"],
    isFeatured: false,
    collection: "NOCTURNAL COLLECTION // 004",
    intensity: "Moderate",
    volume: "50ml Extrait de Parfum",
    topNote: "Bergamot, Cardamom",
    heartNote: "Golden Amber, Benzoin Tears",
    baseNote: "Madagascar Vanilla, Patchouli",
    rating: 3.2,
    ratingCount: 11,
    reviewCount: 2,
  },
  {
    slug: "iris-smoke",
    name: "Iris Smoke",
    description: "Powdery Florentine orris root colliding with smoked gaiac wood and soft white suede.",
    price: 7500,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000",
    ],
    scentNotes: ["Floral", "Woody"],
    isFeatured: false,
    collection: "MONOLITH SERIES // 005",
    intensity: "Subtle",
    volume: "50ml Extrait de Parfum",
    topNote: "Orris Root, Pink Pepper",
    heartNote: "Smoked Gaiac, Violet Leaf",
    baseNote: "White Musk, Suede, Sandalwood",
    rating: 4.0,
    ratingCount: 8,
    reviewCount: 1,
  },
  {
    slug: "santal-brut",
    name: "Santal Brut",
    description: "Raw Australian sandalwood shavings, cardamom pods, and crisp papyrus in brutalist harmony.",
    price: 8800,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
    ],
    scentNotes: ["Woody", "Fresh"],
    isFeatured: false,
    collection: "CLINICAL SERIES // 006",
    intensity: "Moderate",
    volume: "50ml Extrait de Parfum",
    topNote: "Violet, Cardamom",
    heartNote: "Iris, Papyrus, Amber",
    baseNote: "Cedarwood, Sandalwood",
    rating: 3.4,
    ratingCount: 12,
    reviewCount: 3,
  },
];

async function seed() {
  console.log("Connecting to nascent_dev database...");
  await mongoose.connect(uri);
  console.log("Connected.");

  console.log("Seeding products...");
  for (const item of SAMPLE_PRODUCTS) {
    await Product.findOneAndUpdate(
      { slug: item.slug },
      { $set: item },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`✓ Product: ${item.name} (${item.slug})`);
  }

  console.log("Seeding default store settings...");
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({});
    console.log("✓ Created default settings");
  } else {
    console.log("✓ Settings already present");
  }

  console.log("\n✅ Dev database seeding complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
