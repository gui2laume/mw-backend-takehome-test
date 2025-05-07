import axios, { AxiosResponse } from 'axios';

import { VehicleValuation } from '../../models/vehicle-valuation';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';
import { VehicleValuationApiResponse } from '@app/api-client/types/VehicleValuationApiResponse';
import { ProviderLogs } from '@app/models/provider-logs';

const provider : string = 'SuperCar';
const baseURL : string = 'https://run.mocky.io/v3/9245229e-5c57-44e1-964b-36c7fb29168b';

export async function fetchValuationFromSuperCar(
  vrm: string,
  mileage: number,
): Promise<VehicleValuationApiResponse> {


  const startTime : Date = new Date();
  const vehicleValuationApiResponse : VehicleValuationApiResponse = new VehicleValuationApiResponse();
  const response : AxiosResponse<SuperCarValuationResponse> = await axios.get<SuperCarValuationResponse>(
    `${baseURL}/valuations/${vrm}?mileage=${mileage}`,
  );

  if (response.data) {
    vehicleValuationApiResponse.valuation = new VehicleValuation();
    vehicleValuationApiResponse.valuation.vrm = vrm;
    vehicleValuationApiResponse.valuation.provider = provider;
    vehicleValuationApiResponse.valuation.lowestValue = response.data.valuation.lowerValue;
    vehicleValuationApiResponse.valuation.highestValue = response.data.valuation.upperValue;
  }
  vehicleValuationApiResponse.audit = new ProviderLogs();
  vehicleValuationApiResponse.audit.date = startTime;
  vehicleValuationApiResponse.audit.url = baseURL;
  vehicleValuationApiResponse.audit.status = response.status;
  vehicleValuationApiResponse.audit.message = response.statusText;
  vehicleValuationApiResponse.audit.duration = Date.now() - startTime.valueOf();
  vehicleValuationApiResponse.audit.error = (response.status != 200) && (response.status != 404)

  return vehicleValuationApiResponse;
}
