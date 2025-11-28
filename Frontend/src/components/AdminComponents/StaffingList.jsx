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
import staffingService from '../../services/staffingService';

export function StaffingList() {
  const navigate = useNavigate();

  const [staffingList, setStaffingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllStaffing();
  }, []);

  const fetchAllStaffing = async () => {
    try {
      setLoading(true);
      const data = await staffingService.getAllStaffing();
      setStaffingList(data);
    } catch (err) {
      setError('Failed to load staffing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffingId) => {
    if (window.confirm('Are you sure you want to delete this staffing role?')) {
      try {
        await staffingService.deleteStaffing(staffingId);
        fetchAllStaffing();
      } catch (err) {
        setError('Failed to delete staffing');
      }
    }
  };

  const headers = [
    { key: 'country', header: 'Country' },
    { key: 'role', header: 'Role' },
    { key: 'band', header: 'Band' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredStaffing = staffingList.filter((staffing) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      staffing.country?.toLowerCase().includes(searchLower) ||
      staffing.role?.toLowerCase().includes(searchLower) ||
      staffing.band?.toString().includes(searchQuery)
    );
  });

  const rows = filteredStaffing.map((staffing) => ({
    id: staffing.staffing_id,
    country: staffing.country || '-',
    role: staffing.role || '-',
    band: staffing.band || '-',
    actions: staffing.staffing_id,
  }));

  if (loading) {
    return <DataTableSkeleton headers={headers} rowCount={10} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Staffing Roles Management</h2>
        <p style={{ color: '#525252', marginTop: '0.5rem' }}>
          Manage master staffing roles (Country, Role, Band combinations)
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
                  placeholder="Search staffing..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button renderIcon={Add} onClick={() => navigate('/admin/staffing/create')}>
                  Add Staffing Role
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
                {rows.map((row) => (
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
                                onClick={() => navigate(`/admin/staffing/edit/${row.id}`)}
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
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DataTable>
    </div>
  );
}
