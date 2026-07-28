import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { Grid3X3, LayoutList, ChevronLeft, ChevronRight, SlidersHorizontal, X, PackageSearch } from 'lucide-react';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button, LinkButton } from '../components/ui/Button';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'name';

const PAGE_SIZE = 12;

const SIMULATED_LOAD_MS = 350;

export function Products() {
  const { products } = useProducts();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocalCountry, setSelectedLocalCountry] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q')?.trim() ?? '';
  const countryParam = searchParams.get('country')?.trim() ?? '';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
  const countries = useMemo(() => ['All', ...new Set(products.map(p => p.country))].sort(), [products]);

  const activeCountryFilter = countryParam || selectedLocalCountry;

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return products
      .filter(p => {
        const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
        const countryMatch = activeCountryFilter === 'All' || p.country === activeCountryFilter;
        const searchMatch = !normalizedQuery || [p.name, p.description, p.category, p.country].some(v => v.toLowerCase().includes(normalizedQuery));
        return categoryMatch && countryMatch && searchMatch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'rating': return b.rating - a.rating;
          case 'name': return a.name.localeCompare(b.name);
          default: return 0;
        }
      });
  }, [products, selectedCategory, activeCountryFilter, sortBy, searchQuery]);

  useEffect(() => { setPage(1); }, [selectedCategory, activeCountryFilter, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters = selectedCategory !== 'All' || activeCountryFilter !== 'All' || !!searchQuery;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedLocalCountry('All');
    setSearchParams(p => { p.delete('q'); p.delete('country'); return p; });
  };

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-14 pb-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mb-2 tracking-tight">All products</h1>
              <p className="text-muted-foreground text-sm">
                {products.length} items from {countries.length - 1} countries
              </p>
            </div>
            {(searchQuery || countryParam) && (
              <div className="flex gap-2 flex-wrap">
                {searchQuery && (
                  <button
                    onClick={() => setSearchParams(p => { p.delete('q'); return p; })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    "{searchQuery}"
                  </button>
                )}
                {countryParam && (
                  <button
                    onClick={() => setSearchParams(p => { p.delete('country'); return p; })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    {countryParam}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border border-border rounded-xl p-4 sm:p-5 bg-surface">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="ml-auto text-xs text-muted-foreground hover:text-primary underline underline-offset-2">
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {countryParam ? (
            <p className="text-sm text-muted-foreground">
              Showing products from <span className="text-foreground font-medium">{countryParam}</span> — remove the filter chip above to see everything.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground" htmlFor="country-filter">Country</label>
              <select
                id="country-filter"
                value={selectedLocalCountry}
                onChange={e => setSelectedLocalCountry(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-border bg-card text-foreground outline-none cursor-pointer"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country === 'All' ? 'All countries' : country}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
                {searchQuery && <span> matching "<span className="text-foreground">{searchQuery}</span>"</span>}
              </p>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="text-sm px-3 py-2 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                  <option value="rating">Top rated</option>
                  <option value="name">Name: A to Z</option>
                </select>

                <div className="flex rounded-lg overflow-hidden border border-border">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pageProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pageProducts.map(product => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="flex gap-5 rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-soft transition-all group"
                  >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 overflow-hidden bg-secondary">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="py-4 pr-6 flex flex-col justify-center flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                        <span>{product.flag}</span>
                        <span>{product.country}</span>
                        <span>·</span>
                        <span>{product.category}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-foreground">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">{product.rating} ★ ({product.reviews})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                  .map((n, idx, arr) => (
                    <span key={n} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-muted-foreground text-sm">…</span>}
                      <button
                        onClick={() => goToPage(n)}
                        className={`min-w-[2.25rem] px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          n === currentPage ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="border border-border rounded-xl">
            <EmptyState
              icon={PackageSearch}
              title="No products match your filters"
              description="Try a different category or country, or clear everything and start over."
              action={
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetFilters}>Clear filters</Button>
                  <LinkButton to="/" variant="secondary">Back to home</LinkButton>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
