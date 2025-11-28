import api from './api';

class StaffingService {
  async getAllStaffing() {
    const response = await api.get('/staffing/all');
    return response.data; 
  }

  async getStaffingByOffering(offeringId) {
    const response = await api.get(`/staffing/offering/${offeringId}`);
    return response.data;
  }

  async getStaffingByActivity(activityId) {
    const response = await api.get(`/staffing/activity/${activityId}`);
    return response.data;
  }

  // async getStaffingByOffering(offeringId) {
  //   const response = await api.get(`/staffing/offering/${offeringId}`);
  //   return response.data;
  // }

  async getStaffingById(staffingId) {
    const response = await api.get(`/staffing/${staffingId}`);
    return response.data;
  }

  async createStaffing(staffingData) {
    const response = await api.post('/staffing', staffingData);
    return response.data;
  }

  async updateStaffing(staffingId, staffingData) {
    const response = await api.put(`/staffing/${staffingId}`, staffingData);
    return response.data;
  }

  async deleteStaffing(staffingId) {
    const response = await api.delete(`/staffing/${staffingId}`);
    return response.data;
  }
}

export default new StaffingService();