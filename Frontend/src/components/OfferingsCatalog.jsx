import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import { usePermissions } from '../hooks/usePermissions';
import {
  Search as SearchIcon,
  Filter,
  ArrowRight,
  Add,
  Edit,
  TrashCan,
  Information,
  Launch,
  Document,
  Crossroads,
  CheckmarkFilled,
  WarningAlt,
  Link as LinkIcon,
  Package as PackageIcon,
} from '@carbon/icons-react';
import {
  Button,
  Search,
  Tile,
  Tag,
  Checkbox,
  Dropdown,
  Modal,
  Pagination,
  InlineNotification,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';

import offeringService from '../services/offeringService';
import productService from '../services/productService';

// Skeleton Loading Component for Offerings Grid
function OfferingsGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {[...Array(count)].map((_, index) => (
        <Tile key={index}>
          <div className="mb-3">
            <SkeletonText heading width="80%" />
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <SkeletonPlaceholder style={{ width: '60px', height: '24px' }} />
              <SkeletonPlaceholder style={{ width: '80px', height: '24px' }} />
            </div>
            <SkeletonText paragraph lineCount={3} width="100%" />
          </div>

          <div className="space-y-2 mb-4">
            <SkeletonText width="100%" />
            <SkeletonText width="80%" />
            <SkeletonText width="90%" />
          </div>

          <SkeletonPlaceholder style={{ width: '100%', height: '48px' }} />
        </Tile>
      ))}
    </div>
  );
}

// Skeleton Loading for Filter Sidebar
function FilterSidebarSkeleton() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <SkeletonText heading width="60%" className="mb-4" />
      </div>

      <div className="mb-6">
        <SkeletonText heading width="50%" className="mb-3" />
        <div className="space-y-2">
          <SkeletonText width="70%" />
          <SkeletonText width="80%" />
          <SkeletonText width="60%" />
          <SkeletonText width="75%" />
        </div>
      </div>

      <div className="mb-6">
        <SkeletonText heading width="50%" className="mb-3" />
        <div className="space-y-2">
          <SkeletonText width="65%" />
          <SkeletonText width="70%" />
          <SkeletonText width="75%" />
        </div>
      </div>

      <SkeletonPlaceholder style={{ width: '120px', height: '32px' }} />
    </div>
  );
}

// Detailed Information Modal Component
function OfferingDetailModal({ offering, open, onClose }) {
  if (!offering) return null;

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading={offering.offering_name}
      modalLabel={offering.saas_type || 'Offering Details'}
      passiveModal
      size="lg"
    >
      <div className="space-y-6">
        {/* Offering Summary */}
        {offering.offering_summary && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Document size={20} />
              <h4 className="text-heading-03 font-semibold">Summary</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.offering_summary}</p>
          </div>
        )}

        {/* Scope */}
        {offering.scope_summary && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crossroads size={20} />
              <h4 className="text-heading-03 font-semibold">Scope</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.scope_summary}</p>
          </div>
        )}

        {/* Outcomes */}
        {offering.offering_outcomes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckmarkFilled size={20} />
              <h4 className="text-heading-03 font-semibold">Expected Outcomes</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.offering_outcomes}</p>
          </div>
        )}

        {/* Key Deliverables */}
        {offering.key_deliverables && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Document size={20} />
              <h4 className="text-heading-03 font-semibold">Key Deliverables</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.key_deliverables}</p>
          </div>
        )}

        {/* Prerequisites */}
        {offering.prerequisites && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <WarningAlt size={20} className="text-yellow-30" />
              <h4 className="text-heading-03 font-semibold">Prerequisites</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.prerequisites}</p>
          </div>
        )}

        {/* Part Number */}
        {offering.part_numbers && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PackageIcon size={20} />
              <h4 className="text-heading-03 font-semibold">Part Number</h4>
            </div>
            <div className="ml-7 text-body-01 font-mono">{offering.part_numbers}</div>
          </div>
        )}

        {/* Seismic Link */}
        {offering.seismic_link && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={20} />
              <h4 className="text-heading-03 font-semibold">Content Resources</h4>
            </div>
            <a
              href={offering.seismic_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-7 text-link-01 flex items-center gap-1 hover:underline"
            >
              View in Seismic <Launch size={16} />
            </a>
          </div>
        )}

        {/* Summary */}
        <div className="bg-layer-01 p-4 mt-4">
          <div className="flex justify-between text-body-01 mb-2">
            <span>Duration:</span>
            <span className="font-semibold">{offering.duration || 'N/A'}</span>
          </div>
          {offering.industry && (
            <div className="flex justify-between text-body-01 mb-2">
              <span>Industry:</span>
              <span className="font-semibold">{offering.industry}</span>
            </div>
          )}
          {offering.client_type && (
            <div className="flex justify-between text-body-01">
              <span>Client Type:</span>
              <span className="font-semibold">{offering.client_type}</span>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {(offering.offering_sales_contact || offering.offering_product_manager) && (
          <div className="bg-layer-01 p-4">
            <h4 className="text-heading-03 font-semibold mb-3">Contact Information</h4>
            {offering.offering_sales_contact && (
              <div className="flex justify-between text-body-01 mb-2">
                <span>Sales Contact:</span>
                <a href={`mailto:${offering.offering_sales_contact}`} className="text-link-01">
                  {offering.offering_sales_contact}
                </a>
              </div>
            )}
            {offering.offering_product_manager && (
              <div className="flex justify-between text-body-01">
                <span>Product Manager:</span>
                <a href={`mailto:${offering.offering_product_manager}`} className="text-link-01">
                  {offering.offering_product_manager}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function OfferingsCatalog() {
  const { user, userRoles } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [brands, setBrands] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allOfferings, setAllOfferings] = useState([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('offering_name');
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSaasTypes, setSelectedSaasTypes] = useState([]);
  
  const [detailModalOffering, setDetailModalOffering] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all brands
      const brandsData = await offeringService.getBrands();
      setBrands(brandsData);

      // Fetch all products
      const productsData = await productService.getAllProducts();
      setAllProducts(productsData);

      // Fetch all offerings
      const offeringsData = await offeringService.searchOfferings({});
      setAllOfferings(offeringsData);

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffering = () => {
    navigate('/admin/offerings/create');
  };

  const handleEditOffering = (offeringId, e) => {
    e.stopPropagation();
    navigate(`/admin/offerings/edit/${offeringId}`);
  };

  const handleDeleteOffering = async (offeringId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this offering?')) {
      try {
        await offeringService.deleteOffering(offeringId);
        setAllOfferings(allOfferings.filter(o => o.offering_id !== offeringId));
      } catch (err) {
        setError('Failed to delete offering');
      }
    }
  };

  // Get unique values for filters
  const uniqueBrands = brands.map(b => ({ id: b.brand_id, name: b.brand_name }));
  const uniqueProducts = allProducts.map(p => ({ id: p.product_id, name: p.product_name }));
  const uniqueSaasTypes = [...new Set(allOfferings.map(off => off.saas_type).filter(Boolean))];

  // Create a product lookup for displaying product names
  const productLookup = {};
  allProducts.forEach(product => {
    productLookup[product.product_id] = product.product_name;
  });

  // Filter and sort offerings
  const filteredOfferings = allOfferings.filter(offering => {
    const matchesSearch = 
      offering.offering_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.offering_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.tag_line?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(offering.brand);
    
    const matchesProduct = selectedProducts.length === 0 || selectedProducts.includes(offering.product_id);
    
    const matchesSaasType = selectedSaasTypes.length === 0 || selectedSaasTypes.includes(offering.saas_type);
    
    return matchesSearch && matchesBrand && matchesProduct && matchesSaasType;
  });

  const sortedOfferings = [...filteredOfferings].sort((a, b) => {
    switch (sortBy) {
      case 'duration':
        return (a.duration || '').localeCompare(b.duration || '');
      case 'offering_name':
      default:
        return (a.offering_name || '').localeCompare(b.offering_name || '');
    }
  });

  const totalPages = Math.ceil(sortedOfferings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOfferings = sortedOfferings.slice(startIndex, endIndex);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const sortItems = [
    { id: 'offering_name', text: 'Name' },
    { id: 'duration', text: 'Duration' },
  ];

  // Show loading state with skeleton
  if (loading && brands.length === 0) {
    return (
      <div className="min-h-screen cds--g10">
        <div className="flex" style={{paddingTop:'2.5rem'}}>
          <aside 
            className="w-64 bg-layer-01 min-h-screen"
            style={{ borderRight: '1px solid #cbcbcbff' }}
          >
            <FilterSidebarSkeleton />
          </aside>
          <main className="flex-1 p-6 bg-background">
            <Tile className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 w-full md:max-w-md">
                  <SkeletonPlaceholder style={{ width: '100%', height: '48px' }} />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonPlaceholder style={{ width: '100px', height: '48px' }} />
                  <SkeletonPlaceholder style={{ width: '120px', height: '48px' }} />
                </div>
              </div>
              <div className="mt-3">
                <SkeletonText width="30%" />
              </div>
            </Tile>
            <OfferingsGridSkeleton count={6} />
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && brands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <InlineNotification
            kind="error"
            title="Error Loading Data"
            subtitle={error}
            lowContrast
          />
          <Button onClick={fetchInitialData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // STANDARD VIEW
  return (
    <div className="min-h-screen cds--g10">
      <div className="flex" style={{paddingTop:'2.5rem'}}>
        {/* Left Sidebar - Filters */}
        <aside 
          className={`${showFilters ? 'w-64' : 'w-0'} bg-layer-01 transition-all duration-300 overflow-hidden min-h-screen`}
          style={{ borderRight: '1px solid #cbcbcbff' }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} />
              <h2 className="text-heading-03 font-semibold">Filters</h2>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h3 className="mb-3 text-heading-03 font-semibold">Brand</h3>
              <fieldset className="space-y-2">
                {uniqueBrands.map(brand => (
                  <Checkbox
                    key={brand.id}
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands([...selectedBrands, brand.name]);
                      } else {
                        setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                      }
                      handleFilterChange();
                    }}
                    labelText={brand.name}
                  />
                ))}
              </fieldset>
            </div>

            {/* Product Filter */}
            <div className="mb-6">
              <h3 className="mb-3 text-heading-03 font-semibold">Product</h3>
              <fieldset className="space-y-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {uniqueProducts.length > 0 ? (
                  uniqueProducts.map(product => (
                    <Checkbox
                      key={product.id}
                      id={`product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(p => p !== product.id));
                        }
                        handleFilterChange();
                      }}
                      labelText={product.name}
                    />
                  ))
                ) : (
                  <p className="text-body-01" style={{ color: '#8d8d8d' }}>No products available</p>
                )}
              </fieldset>
            </div>

            {/* SaaS Type Filter */}
            <div className="mb-6">
              <h3 className="mb-3 text-heading-03 font-semibold">SaaS Type</h3>
              <fieldset className="space-y-2">
                {uniqueSaasTypes.map(type => (
                  <Checkbox
                    key={type}
                    id={`type-${type}`}
                    checked={selectedSaasTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSaasTypes([...selectedSaasTypes, type]);
                      } else {
                        setSelectedSaasTypes(selectedSaasTypes.filter(t => t !== type));
                      }
                      handleFilterChange();
                    }}
                    labelText={type}
                  />
                ))}
              </fieldset>
            </div>

            {/* Clear Filters */}
            <Button
              kind="ghost"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedProducts([]);
                setSelectedSaasTypes([]);
                handleFilterChange();
              }}
            >
              Clear all filters
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-background">
          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              className="mb-4"
            />
          )}

          {/* Search and Sort Bar */}
          <Tile className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <Search
                  size="lg"
                  placeholder="Search offerings..."
                  labelText="Search"
                  closeButtonLabelText="Clear search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-label-01">Sort by:</span>
                <Dropdown
                  style={{width:'7rem'}}
                  id="sort-dropdown"
                  titleText=""
                  label="Sort by"
                  items={sortItems}
                  selectedItem={sortItems.find(item => item.id === sortBy)}
                  onChange={({ selectedItem }) => setSortBy(selectedItem.id)}
                  itemToString={(item) => (item ? item.text : '')}
                />
                {permissions.canEditOfferings && (
                  <Button
                    onClick={handleCreateOffering}
                    renderIcon={Add}
                    size="lg"
                  >
                    Create New Offering
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-body-01">
              <div>
                Showing {Math.min(startIndex + 1, sortedOfferings.length)}-{Math.min(endIndex, sortedOfferings.length)} of {sortedOfferings.length} offerings
              </div>
              {totalPages > 1 && (
                <div className="text-label-01">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </Tile>

          {/* Offerings Grid */}
          {loading ? (
            <OfferingsGridSkeleton count={itemsPerPage} />
          ) : currentOfferings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {currentOfferings.map(offering => (
                  <Tile
                    key={offering.offering_id}
                    className="hover:shadow-lg transition-shadow"
                    style={{
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-heading-03 flex-1 font-semibold">
                        {offering.offering_name}
                      </h3>
                      <div className="flex gap-1">
                        {/* <Button
                          kind="ghost"
                          size="sm"
                          hasIconOnly
                          renderIcon={Information}
                          iconDescription="View details"
                          onClick={() => setDetailModalOffering(offering)} /> */}
                        {permissions.canEditOfferings && (
                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={Edit}
                            iconDescription="Edit offering"
                            onClick={(e) => handleEditOffering(offering.offering_id, e)} />
                        )}
                        {permissions.canDeleteOfferings && (
                          <Button
                            kind="ghost"
                            size="sm"
                            hasIconOnly
                            renderIcon={TrashCan}
                            iconDescription="Delete offering"
                            onClick={(e) => handleDeleteOffering(offering.offering_id, e)} />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {offering.saas_type && <Tag type="cool-gray">{offering.saas_type}</Tag>}
                        {offering.brand && <Tag type="blue">{offering.brand}</Tag>}
                        {offering.product_id && productLookup[offering.product_id] && (
                          <Tag type="purple">{productLookup[offering.product_id]}</Tag>
                        )}
                        {permissions.isAdmin && (
                          <Tag type="red" size="sm">ADMIN VIEW</Tag>
                        )}
                      </div>
                      <p className="text-body-01">
                        {offering.tag_line || (offering.offering_summary ? offering.offering_summary.substring(0, 100) + '...' : 'No description available')}
                      </p>
                    </div>

                    <div className="space-y-1 mb-4 text-body-01">
                      {offering.part_numbers && (
                        <div className="flex justify-between">
                          <span>Part #:</span>
                          <span className="font-mono text-label-01">{offering.part_numbers}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold">{offering.duration || 'N/A'}</span>
                      </div>
                      {offering.industry && (
                        <div className="flex justify-between">
                          <span>Industry:</span>
                          <span className="text-label-01">{offering.industry}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <Button
                        kind="primary"
                        onClick={() => navigate(`/offering/${offering.offering_id}`)}
                        renderIcon={ArrowRight}
                        style={{
                          width: '100%',
                          maxWidth: '100%',
                          justifyContent: 'center',
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </Tile>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalItems={sortedOfferings.length}
                  pageSize={itemsPerPage}
                  pageSizes={[6, 12, 24]}
                  onChange={({ page, pageSize }) => {
                    setCurrentPage(page);
                    setItemsPerPage(pageSize);
                  }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <SearchIcon size={64} className="mx-auto mb-4" style={{ opacity: 0.3 }} />
                <h3 className="text-heading-04 mb-2 font-semibold">No offerings found</h3>
                <p className="text-body-01">Try adjusting your filters or search query</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {/* {detailModalOffering && (
        <OfferingDetailModal
          offering={detailModalOffering}
          open={!!detailModalOffering}
          onClose={() => setDetailModalOffering(null)}
        />
      )} */}
    </div>
  );
}
