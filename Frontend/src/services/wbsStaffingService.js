import api from './api';

const wbsStaffingService = {
  getStaffingForWBS: async (wbsId) => {
    const response = await api.get(`/wbs-staffing/${wbsId}`);
    return response.data;
  },

  addStaffingToWBS: async (wbsId, staffingId, hours) => {
    const response = await api.post('/wbs-staffing/', null, {
      params: { wbs_id: wbsId, staffing_id: staffingId, hours }
    });
    return response.data;
  },

  updateWBSStaffingHours: async (wbsId, staffingId, hours) => {
    const response = await api.put(`/wbs-staffing/${wbsId}/${staffingId}`, null, {
      params: { hours }
    });
    return response.data;
  },

  removeStaffingFromWBS: async (wbsId, staffingId) => {
    const response = await api.delete(`/wbs-staffing/${wbsId}/${staffingId}`);
    return response.data;
  },
};

export default wbsStaffingService;
