import { ProviderLogs } from '@app/models/provider-logs';
import { VehicleValuation } from '@app/models/vehicle-valuation';

export class VehicleValuationApiResponse  {
  audit : ProviderLogs;
  valuation: VehicleValuation | null;
}