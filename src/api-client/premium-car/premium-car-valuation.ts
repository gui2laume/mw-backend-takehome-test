import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

import { PremiumCarValuationResponse } from '@app/api-client/premium-car/types/premium-car-valuation-response';
import { VehicleValuationApiResponse } from '@app/api-client/types/VehicleValuationApiResponse';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { ProviderLogs } from '@app/models/provider-logs';

const provider : string = 'PremiumCar';

export async function fetchValuationFromPremiumCar(
  vrm: string
): Promise<VehicleValuationApiResponse> {
  const baseURL: string =
    'https://run.mocky.io/v3/0dfda26a-3a5a-43e5-b68c-51f148eda473';
  const startTime : Date = new Date();
  const response = await axios.get(`${baseURL}/valueCar/?vrm=${vrm}`, {
    headers: { Accept: 'application/xml' },
  });
  const parser: XMLParser = new XMLParser();
  let premiumCarValuationResponse: PremiumCarValuationResponse;
  try {
    premiumCarValuationResponse = parser.parse(response.data);
  } catch (e) {
    throw new Error('no response from premium car');
  }

  const lowestValue : number = Math.min(
    premiumCarValuationResponse.root.ValuationPrivateSaleMinimum,
    premiumCarValuationResponse.root.ValuationDealershipMinimum,
  );
  const highestValue : number = Math.max(
    premiumCarValuationResponse.root.ValuationPrivateSaleMaximum,
    premiumCarValuationResponse.root.ValuationDealershipMaximum,
  );

  const vehicleValuationApiResponse : VehicleValuationApiResponse = new VehicleValuationApiResponse();
  vehicleValuationApiResponse.valuation = new VehicleValuation();
  vehicleValuationApiResponse.valuation.vrm = vrm;
  vehicleValuationApiResponse.valuation.provider = provider;
  vehicleValuationApiResponse.valuation.lowestValue = lowestValue;
  vehicleValuationApiResponse.valuation.highestValue = highestValue;

  vehicleValuationApiResponse.audit = new ProviderLogs();
  vehicleValuationApiResponse.audit.date = startTime;
  vehicleValuationApiResponse.audit.url = baseURL;
  vehicleValuationApiResponse.audit.status = response.status;
  vehicleValuationApiResponse.audit.message = response.statusText;
  vehicleValuationApiResponse.audit.duration = Date.now() - startTime.valueOf();
  vehicleValuationApiResponse.audit.error = (response.status != 200) && (response.status != 404)

  return vehicleValuationApiResponse;
}
