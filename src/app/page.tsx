import { Masthead } from "@/components/ui/Masthead";
import { Grid, GridItem } from "@/components/layout/Grid";
import { PRODUCTS, CATEGORIES } from "@/components/dummy-data";
import Image from "next/image";

/**
 * Editorial Home Page (D-09)
 * Establishes the initial styling baseline for the design system.
 */
export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Masthead />
      
      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="border-b border-black">
          <Grid>
            <GridItem cols={12} className="py-24 lg:py-48 flex flex-col items-center text-center">
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-light tracking-tighter uppercase mb-8">
                The Science of Silence
              </h1>
              <p className="max-w-xl text-lg lg:text-xl font-light leading-relaxed">
                Olfactory explorations rooted in clinical minimalism and high-end editorial precision.
              </p>
            </GridItem>
          </Grid>
        </section>

        {/* Featured Products Grid */}
        <section className="border-b border-black">
          <Grid>
            {featuredProducts.map((product, idx) => (
              <GridItem 
                key={product.id} 
                cols={6} 
                mdCols={4}
                borderRight={idx % 2 === 0}
                className="group cursor-pointer p-0 lg:p-0"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-black">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 lg:p-8 flex justify-between items-baseline">
                  <div>
                    <h2 className="text-sm font-semibold tracking-widest uppercase">{product.name}</h2>
                    <p className="text-[11px] font-light uppercase opacity-60">{product.scentNotes.slice(0, 2).join(" / ")}</p>
                  </div>
                  <span className="text-sm">${product.price}</span>
                </div>
              </GridItem>
            ))}
          </Grid>
        </section>

        {/* Categories Section */}
        <section>
          <Grid>
            {CATEGORIES.map((category, idx) => (
              <GridItem 
                key={category.id} 
                cols={4} 
                borderRight={idx < CATEGORIES.length - 1}
                className="hover:bg-black hover:text-white transition-colors duration-300"
              >
                <h3 className="text-2xl font-light tracking-tight mb-4 uppercase">{category.name}</h3>
                <p className="text-[11px] font-light leading-relaxed uppercase opacity-80">
                  {category.description}
                </p>
              </GridItem>
            ))}
          </Grid>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black py-12 px-6 lg:px-8 bg-white mt-auto text-[10px] font-semibold tracking-[0.2em] uppercase text-center">
        &copy; 2026 Nascent Scent Studio. All Rights Reserved.
      </footer>
    </div>
  );
}
