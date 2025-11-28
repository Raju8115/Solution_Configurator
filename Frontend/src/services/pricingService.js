import api from './api';

class PricingService {
  async getPricingDetails(staffingId, country) {
    try {
      const response = await api.get('/pricingDetails', {
        params: {
          staffing_id: staffingId,
          country: country
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing details:', error);
      throw error;
    }
  }

    async getPricingById(pricingId){
      try{
        const response = await api.get(`/pricing/${pricingId}`);
        return response.data;
      }catch(error){
        console.error('Error fetching pricing by id:', error);
        throw error;
      }
  }

  async getTotalHoursAndPrices(offeringId) {
    try {
      const response = await api.get(`/totalHoursAndPrices/${offeringId}`);
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('Error fetching total hours and prices:', error);
      throw error;
    }
  }

  async getAllPricing() {
    const response = await api.get('/pricing/all');
    return response.data;
  }

  async getPricingByCountry(country) {
    const response = await api.get(`/pricing/search?country=${country}`);
    return response.data;
  }

  async getPricingDetail(country, role, band) {
    const response = await api.get(`/pricingDetails?country=${country}&role=${role}&band=${band}`);
    return response.data;
  }

  async createPricing(pricingData) {
    const response = await api.post('/pricing', pricingData);
    return response.data;
  }

  async updatePricing(pricingId, pricingData) {
    const response = await api.put(`/pricing/${pricingId}`, pricingData);
    return response.data;
  }

  async deletePricing(pricingId) {
    const response = await api.delete(`/pricing/${pricingId}`);
    return response.data;
  }
}

export default new PricingService();