import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextInput,
  NumberInput,
  Button,
  InlineNotification,
  Tile,
  Grid,
  Column,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import staffingService from '../../services/staffingService';

export function StaffingForm() {
  const { staffingId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(staffingId);

  const [formData, setFormData] = useState({
    country: '',
    role: '',
    band: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchStaffing();
    }
  }, [staffingId]);

  const fetchStaffing = async () => {
    try {
      setInitialLoading(true);
      const data = await staffingService.getStaffingById(staffingId);
      setFormData({
        country: data.country || '',
        role: data.role || '',
        band: data.band || '',
      });
    } catch (err) {
      setError('Failed to load staffing');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country || !formData.role || !formData.band) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await staffingService.updateStaffing(staffingId, formData);
      } else {
        await staffingService.createStaffing(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/staffing');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save staffing');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: '2rem' }}>
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
          onClick={() => navigate('/admin/staffing')}
        >
          Back to Staffing List
        </Button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          {isEditMode ? 'Edit Staffing Role' : 'Create New Staffing Role'}
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
          subtitle={isEditMode ? 'Staffing updated successfully!' : 'Staffing created successfully!'}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Tile>
        <Form onSubmit={handleSubmit}>
          <Grid>
            <Column lg={16}>
              <TextInput
                id="country"
                labelText="Country *"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., United States, India-GDC"
              />
            </Column>

            <Column lg={8}>
              <TextInput
                id="role"
                labelText="Role *"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., Project Manager, Consultant"
              />
            </Column>

            <Column lg={8}>
              <NumberInput
                id="band"
                label="Band *"
                value={formData.band}
                onChange={(e, { value }) => setFormData({ ...formData, band: e.target.value })}
                min={1}
                max={10}
              />
            </Column>

            <Column lg={16}>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <Button type="submit" renderIcon={Save} disabled={loading}>
                  {loading ? 'Saving...' : isEditMode ? 'Update Staffing' : 'Create Staffing'}
                </Button>
                <Button
                  kind="secondary"
                  onClick={() => navigate('/admin/staffing')}
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
