import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  NumberInput,
  Dropdown,
  Button,
  InlineNotification,
  Tile,
  Grid,
  Column,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import pricingService from '../../services/pricingService';
import staffingService from '../../services/staffingService';

export function PricingForm() {
  const { pricingId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(pricingId);

  const [formData, setFormData] = useState({
    staffing_id: '',
    cost: '',
    sale_price: '',
  });

  const [staffingList, setStaffingList] = useState([]);
  const [selectedStaffing, setSelectedStaffing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStaffingList();
  }, []);

  useEffect(() => {
    if (isEditMode && staffingList.length > 0) {
      fetchPricing();
    }
  }, [pricingId, staffingList]);

  const fetchStaffingList = async () => {
    try {
      const data = await staffingService.getAllStaffing();
      console.log('Fetched staffing list:', data);
      setStaffingList(data);
    } catch (err) {
      console.error('Error fetching staffing:', err);
      setError('Failed to load staffing options');
    } finally {
      if (!isEditMode) {
        setInitialLoading(false);
      }
    }
  };

  const fetchPricing = async () => {
    try {
      setInitialLoading(true);
      const data = await pricingService.getPricingById(pricingId);
      console.log('Fetched pricing data:', data);
      
      setFormData({
        staffing_id: data.staffing_id || '',
        cost: data.cost || '',
        sale_price: data.sale_price || '',
      });
      
      // Find and set selected staffing for display
      // The API now returns role, band, country in the pricing response
      const staffing = staffingList.find(s => s.staffing_id === data.staffing_id);
      
      if (staffing) {
        setSelectedStaffing(staffing);
        console.log('Selected staffing:', staffing);
      } else if (data.role && data.band && data.country) {
        // If not found in list, create from pricing data
        const staffingFromPricing = {
          staffing_id: data.staffing_id,
          role: data.role,
          band: data.band,
          country: data.country
        };
        setSelectedStaffing(staffingFromPricing);
        console.log('Selected staffing from pricing:', staffingFromPricing);
      }
    } catch (err) {
      console.error('Error fetching pricing:', err);
      setError('Failed to load pricing');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staffing_id) {
      setError('Staffing selection is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await pricingService.updatePricing(pricingId, {
          cost: formData.cost,
          sale_price: formData.sale_price,
        });
      } else {
        await pricingService.createPricing(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/pricing');
      }, 1500);
    } catch (err) {
      console.error('Error saving pricing:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to save pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffingChange = ({ selectedItem }) => {
    setFormData({
      ...formData,
      staffing_id: selectedItem?.staffing_id || '',
    });
    setSelectedStaffing(selectedItem);
  };

  if (initialLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <SkeletonText heading width="50%" style={{ marginBottom: '1rem' }} />
        <SkeletonPlaceholder style={{ width: '100%', height: '400px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/admin/pricing')}
        >
          Back to Pricing List
        </Button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          {isEditMode ? 'Edit Pricing' : 'Create New Pricing'}
        </h2>
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

      {success && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={isEditMode ? 'Pricing updated successfully!' : 'Pricing created successfully!'}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Tile>
        <Form onSubmit={handleSubmit}>
          <Grid>
            <Column lg={16}>
              <Dropdown
                id="staffing-dropdown"
                titleText="Staffing Role *"
                label={selectedStaffing 
                  ? `${selectedStaffing.role} - Band ${selectedStaffing.band} (${selectedStaffing.country})`
                  : "Select a staffing role..."
                }
                items={staffingList}
                itemToString={(item) =>
                  item
                    ? `${item.role} - Band ${item.band} (${item.country})`
                    : ''
                }
                selectedItem={selectedStaffing}
                onChange={handleStaffingChange}
                disabled={isEditMode} // Can't change staffing for existing pricing
                invalid={!formData.staffing_id && error}
                invalidText="Please select a staffing role"
              />
            </Column>

            <Column lg={8}>
              <NumberInput
                id="cost"
                label="Cost (per hour) *"
                value={formData.cost}
                onChange={(e, { value }) =>
                  setFormData({ ...formData, cost: value })
                }
                min={0}
                step={0.01}
                allowEmpty
                placeholder="0.00"
              />
            </Column>

            <Column lg={8}>
              <NumberInput
                id="sale_price"
                label="Sale Price (per hour) *"
                value={formData.sale_price}
                onChange={(e, { value }) =>
                  setFormData({ ...formData, sale_price: value })
                }
                min={0}
                step={0.01}
                allowEmpty
                placeholder="0.00"
              />
            </Column>

            {selectedStaffing && (
              <Column lg={16}>
                <Tile style={{ backgroundColor: '#f4f4f4', marginTop: '1rem', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Selected Staffing Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <strong>Role:</strong> {selectedStaffing.role}
                    </div>
                    <div>
                      <strong>Band:</strong> Band {selectedStaffing.band}
                    </div>
                    <div>
                      <strong>Country:</strong> {selectedStaffing.country}
                    </div>
                  </div>
                </Tile>
              </Column>
            )}

            <Column lg={16}>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <Button
                  type="submit"
                  renderIcon={Save}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEditMode ? 'Update Pricing' : 'Create Pricing'}
                </Button>
                <Button
                  kind="secondary"
                  onClick={() => navigate('/admin/pricing')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Column>
          </Grid>
        </Form>
      </Tile>
    </div>
  );
}
