import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Modal,
  Dropdown,
  NumberInput,
  InlineNotification,
  Tile,
  SkeletonText,
} from '@carbon/react';
import { Add, TrashCan, ArrowLeft, Save } from '@carbon/icons-react';
import wbsStaffingService from '../../services/wbsStaffingService';
import staffingService from '../../services/staffingService';
import wbsService from '../../services/wbsService';

export function WBSStaffingManager() {
  const { wbsId } = useParams();
  const navigate = useNavigate();

  const [wbs, setWbs] = useState(null);
  const [assignedStaffing, setAssignedStaffing] = useState([]);
  const [availableStaffing, setAvailableStaffing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaffing, setSelectedStaffing] = useState(null);
  const [hours, setHours] = useState(40);

  useEffect(() => {
    fetchData();
  }, [wbsId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch WBS details
      const wbsData = await wbsService.getWBSById(wbsId);
      setWbs(wbsData);

      // Fetch assigned staffing
      const assigned = await wbsStaffingService.getStaffingForWBS(wbsId);
      setAssignedStaffing(assigned);

      // Fetch all available staffing
      const allStaffing = await staffingService.getAllStaffing();
      
      // Filter out already assigned staffing
      const assignedIds = assigned.map(s => s.staffing_id);
      const available = allStaffing.filter(s => !assignedIds.includes(s.staffing_id));
      setAvailableStaffing(available);

    } catch (err) {
      setError('Failed to load WBS staffing data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaffing = async () => {
    if (!selectedStaffing) {
      setError('Please select a staffing role');
      return;
    }

    try {
      await wbsStaffingService.addStaffingToWBS(wbsId, selectedStaffing.staffing_id, hours);
      setSuccess('Staffing added to WBS successfully');
      setIsAddModalOpen(false);
      setSelectedStaffing(null);
      setHours(40);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add staffing');
    }
  };

  const handleRemoveStaffing = async (staffingId) => {
    if (window.confirm('Are you sure you want to remove this staffing from the WBS?')) {
      try {
        await wbsStaffingService.removeStaffingFromWBS(wbsId, staffingId);
        setSuccess('Staffing removed successfully');
        fetchData();
      } catch (err) {
        setError('Failed to remove staffing');
      }
    }
  };

  const headers = [
    { key: 'role', header: 'Role' },
    { key: 'band', header: 'Band' },
    { key: 'country', header: 'Country' },
    { key: 'hours', header: 'Hours' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = assignedStaffing.map((staffing) => ({
    id: staffing.staffing_id,
    role: staffing.role,
    band: `Band ${staffing.band}`,
    country: staffing.country,
    hours: `${staffing.hours}h`,
    actions: staffing.staffing_id,
  }));

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <SkeletonText heading width="50%" />
        <SkeletonText paragraph width="100%" lineCount={5} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/admin/wbs')}
        >
          Back to WBS List
        </Button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            Manage WBS Staffing
          </h2>
          {wbs && (
            <p style={{ color: '#525252', marginTop: '0.5rem' }}>
              {wbs.wbs_description}
            </p>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {success && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={success}
          onCloseButtonClick={() => setSuccess(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {/* WBS Info Tile */}
      {wbs && (
        <Tile style={{ marginBottom: '1.5rem', backgroundColor: '#f4f4f4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <strong>WBS Description:</strong>
              <div>{wbs.wbs_description}</div>
            </div>
            <div>
              <strong>Duration:</strong>
              <div>{wbs.wbs_weeks} weeks</div>
            </div>
            <div>
              <strong>Total Assigned Roles:</strong>
              <div>{assignedStaffing.length}</div>
            </div>
          </div>
        </Tile>
      )}

      {/* Data Table */}
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                Assigned Staffing ({assignedStaffing.length})
              </h3>
              <Button
                renderIcon={Add}
                onClick={() => setIsAddModalOpen(true)}
                disabled={availableStaffing.length === 0}
              >
                Add Staffing
              </Button>
            </div>

            {assignedStaffing.length === 0 ? (
              <Tile style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#525252', marginBottom: '1rem' }}>
                  No staffing assigned to this WBS yet
                </p>
                <Button
                  renderIcon={Add}
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={availableStaffing.length === 0}
                >
                  Add Staffing
                </Button>
              </Tile>
            ) : (
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
                              <Button
                                kind="danger--ghost"
                                size="sm"
                                renderIcon={TrashCan}
                                iconDescription="Remove"
                                onClick={() => handleRemoveStaffing(cell.value)}
                                hasIconOnly
                              />
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </DataTable>

      {/* Add Staffing Modal */}
      <Modal
        open={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          setSelectedStaffing(null);
          setHours(40);
        }}
        modalHeading="Add Staffing to WBS"
        primaryButtonText="Add Staffing"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddStaffing}
        size="sm"
      >
        <div style={{ marginBottom: '1rem' }}>
          <Dropdown
            id="staffing-dropdown"
            titleText="Select Staffing Role *"
            label="Choose a staffing role..."
            items={availableStaffing}
            itemToString={(item) =>
              item ? `${item.role} - Band ${item.band} (${item.country})` : ''
            }
            selectedItem={selectedStaffing}
            onChange={({ selectedItem }) => setSelectedStaffing(selectedItem)}
          />
        </div>

        <div>
          <NumberInput
            id="hours"
            label="Hours *"
            value={hours}
            onChange={(e, { value }) => setHours(value)}
            min={1}
            max={1000}
            step={1}
          />
        </div>

        {availableStaffing.length === 0 && (
          <InlineNotification
            kind="info"
            title="No staffing available"
            subtitle="All staffing roles have been assigned to this WBS"
            hideCloseButton
            lowContrast
            style={{ marginTop: '1rem' }}
          />
        )}
      </Modal>
    </div>
  );
}
