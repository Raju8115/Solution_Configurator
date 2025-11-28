import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  InlineNotification,
  DataTableSkeleton,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import pricingService from '../../services/pricingService';
import staffingService from '../../services/staffingService';

export function PricingList() {
  const navigate = useNavigate();

  const [pricingList, setPricingList] = useState([]);
  const [staffingMap, setStaffingMap] = useState({}); // Map staffing_id -> staffing details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both pricing and staffing data
      const [pricingData, staffingData] = await Promise.all([
        pricingService.getAllPricing(),
        staffingService.getAllStaffing()
      ]);

      console.log("Pricing data:", pricingData);
      console.log("Staffing data:", staffingData);

      // Create a map of staffing_id -> staffing details
      const staffingLookup = {};
      staffingData.forEach(staffing => {
        staffingLookup[staffing.staffing_id] = staffing;
      });
      setStaffingMap(staffingLookup);

      // Merge pricing with staffing details
      const enrichedPricing = pricingData.map(pricing => {
        const staffing = staffingLookup[pricing.staffing_id];
        return {
          ...pricing,
          role: staffing?.role || 'Unknown',
          band: staffing?.band || '-',
          country: staffing?.country || 'Unknown'
        };
      });

      // console.log("Enriched pricing:", enrichedPricing);
      setPricingList(enrichedPricing);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pricingId) => {
    if (window.confirm('Are you sure you want to delete this pricing detail?')) {
      try {
        await pricingService.deletePricing(pricingId);
        fetchData();
      } catch (err) {
        setError('Failed to delete pricing');
      }
    }
  };

  const headers = [
    { key: 'role', header: 'Role' },
    { key: 'band', header: 'Band' },
    { key: 'country', header: 'Country' },
    { key: 'cost', header: 'Cost/Hour' },
    { key: 'sale_price', header: 'Sale Price/Hour' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredPricing = pricingList.filter((pricing) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pricing.role?.toLowerCase().includes(searchLower) ||
      pricing.country?.toLowerCase().includes(searchLower) ||
      pricing.band?.toString().includes(searchQuery)
    );
  });

  const rows = filteredPricing.map((pricing) => ({
    id: pricing.pricing_id,
    role: pricing.role || '-',
    band: pricing.band ? `Band ${pricing.band}` : '-',
    country: pricing.country || '-',
    cost: pricing.cost ? `$${Number(pricing.cost).toFixed(2)}` : '-',
    sale_price: pricing.sale_price ? `$${Number(pricing.sale_price).toFixed(2)}` : '-',
    actions: pricing.pricing_id,
  }));

  if (loading) {
    return <DataTableSkeleton headers={headers} rowCount={10} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Pricing Management</h2>
        <p style={{ color: '#525252', marginTop: '0.5rem' }}>
          Manage pricing for staffing roles ({pricingList.length} total)
        </p>
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Search pricing..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  renderIcon={Add}
                  onClick={() => navigate('/admin/pricing/create')}
                >
                  Add Pricing
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length} style={{ textAlign: 'center', padding: '2rem' }}>
                      <p style={{ color: '#525252' }}>No pricing data available</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'actions') {
                          return (
                            <TableCell key={cell.id}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  renderIcon={Edit}
                                  iconDescription="Edit"
                                  onClick={() => {
                                  console.log('Edit clicked - pricing_id:', cell.value);
                                  console.log('Navigating to:', `/admin/pricing/edit/${cell.value}`);
                                  navigate(`/admin/pricing/edit/${cell.value}`);
                                }}
                                  hasIconOnly
                                />
                                <Button
                                  kind="danger--ghost"
                                  size="sm"
                                  renderIcon={TrashCan}
                                  iconDescription="Delete"
                                  onClick={() => handleDelete(row.id)}
                                  hasIconOnly
                                />
                              </div>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
      </DataTable>
    </div>
  );
}
