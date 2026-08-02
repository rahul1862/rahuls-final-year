import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Grid3X3, LayoutList, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'name';

const PAGE_SIZE = 12;

// The catalog is a static import, but we simulate a brief fetch so the page
// has somewhere to put a loading state instead of popping in instantly.
const SIMULATED_LOAD_MS = 350;

function ProductSkeleton() {
  return (
    <div className="border border-[#e4e4e7] rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#f4f4f5]" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 bg-[#f4f4f5] rounded" />
        <div className="h-4 w-4/5 bg-[#f4f4f5] rounded" />
        <div className="h-4 w-1/2 bg-[#f4f4f5] rounded mt-3" />
      </div>
    </div>
  );
}

export function Products() {
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

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], []);
  const countries = useMemo(() => ['All', ...new Set(products.map(p => p.country))].sort(), []);

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
  }, [selectedCategory, activeCountryFilter, sortBy, searchQuery]);

  // Any change to the filter set makes the current page number potentially
  // invalid, so snap back to page 1 rather than showing a blank page.
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-14 pb-8 border-b border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0a0a0a] mb-2 tracking-tight">All products</h1>
              <p className="text-[#71717a] text-sm">
                {products.length} items from {countries.length - 1} countries
              </p>
            </div>
            {(searchQuery || countryParam) && (
              <div className="flex gap-2 flex-wrap">
                {searchQuery && (
                  <button
                    onClick={() => setSearchParams(p => { p.delete('q'); return p; })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[#e4e4e7] text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    "{searchQuery}"
                  </button>
                )}
                {countryParam && (
                  <button
                    onClick={() => setSearchParams(p => { p.delete('country'); return p; })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[#e4e4e7] text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors"
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
        {/* Filters */}
        <div className="mb-8 border border-[#e4e4e7] rounded-lg p-4 sm:p-5 bg-[#fafafa]">
          <div className="flex items-center gap-2 mb-4 text-[#71717a]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="ml-auto text-xs text-[#71717a] hover:text-[#0a0a0a] underline underline-offset-2">
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
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                      : 'bg-white text-[#71717a] border-[#e4e4e7] hover:text-[#0a0a0a] hover:border-[#0a0a0a]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {countryParam ? (
            <p className="text-sm text-[#71717a]">
              Showing products from <span className="text-[#0a0a0a] font-medium">{countryParam}</span> — remove the filter chip above to see everything.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#71717a]" htmlFor="country-filter">Country</label>
              <select
                id="country-filter"
                value={selectedLocalCountry}
                onChange={e => setSelectedLocalCountry(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-[#e4e4e7] bg-white text-[#0a0a0a] outline-none cursor-pointer"
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
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* Toolbar */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[#71717a]">
                {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
                {searchQuery && <span> matching "<span className="text-[#0a0a0a]">{searchQuery}</span>"</span>}
              </p>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="text-sm px-3 py-2 rounded-lg border border-[#e4e4e7] bg-white text-[#0a0a0a] outline-none cursor-pointer"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                  <option value="rating">Top rated</option>
                  <option value="name">Name: A to Z</option>
                </select>

                <div className="flex rounded-lg overflow-hidden border border-[#e4e4e7]">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#a1a1aa] hover:text-[#0a0a0a]'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#a1a1aa] hover:text-[#0a0a0a]'}`}
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
                    className="flex gap-5 rounded-lg overflow-hidden border border-[#e4e4e7] hover:border-[#0a0a0a] transition-colors group"
                  >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 overflow-hidden bg-[#f4f4f5]">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="py-4 pr-6 flex flex-col justify-center flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 text-xs text-[#a1a1aa]">
                        <span>{product.flag}</span>
                        <span>{product.country}</span>
                        <span>·</span>
                        <span>{product.category}</span>
                      </div>
                      <h3 className="font-semibold text-[#0a0a0a] text-base mb-1">{product.name}</h3>
                      <p className="text-sm text-[#71717a] line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-[#0a0a0a]">€{product.price.toFixed(2)}</span>
                        <span className="text-sm text-[#a1a1aa]">{product.rating} ★ ({product.reviews})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#e4e4e7] text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#fafafa] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                  .map((n, idx, arr) => (
                    <span key={n} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-[#a1a1aa] text-sm">…</span>}
                      <button
                        onClick={() => goToPage(n)}
                        className={`min-w-[2.25rem] px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          n === currentPage ? 'bg-[#0a0a0a] text-white' : 'text-[#71717a] hover:bg-[#fafafa] hover:text-[#0a0a0a]'
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[#e4e4e7] text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#fafafa] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 border border-[#e4e4e7] rounded-lg">
            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">No products match your filters</h3>
            <p className="text-sm text-[#71717a] mb-6">Try a different category or country, or clear everything and start over.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#0a0a0a] text-white hover:bg-[#2a2a2a] transition-colors"
              >
                Clear filters
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#e4e4e7] text-[#0a0a0a] hover:bg-[#fafafa] transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
