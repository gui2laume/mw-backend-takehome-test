import { VehicleValuation } from '@app/models/vehicle-valuation';
import { fetchValuationFromSuperCar } from '@app/api-client/super-car/super-car-valuation';
import { VehicleValuationApiResponse } from '@app/api-client/types/VehicleValuationApiResponse';
import { FastifyInstance } from 'fastify';
import { ProviderLogs } from '@app/models/provider-logs';
import { fetchValuationFromPremiumCar } from '@app/api-client/premium-car/premium-car-valuation';

export async function fetchValuation(
  vrm: string,
  mileage: number,
  fastifyInstance: FastifyInstance,
): Promise<VehicleValuation | null> {
  const valuationRepository = fastifyInstance.orm.getRepository(VehicleValuation);

  const valuationFromDb: VehicleValuation | null = await findValuation(vrm, fastifyInstance);
  if (valuationFromDb) {
    return valuationFromDb;
  }
  let response: VehicleValuationApiResponse = await fetchValuationFromSuperCar(vrm, mileage);
  await logResponse(response, fastifyInstance);
  if ((response.audit.status != 200)&&(response.audit.status != 404)) {
    response = await fetchValuationFromPremiumCar(vrm);
    await logResponse(response, fastifyInstance);
  }
  // Save valuation to DB.
  if (response.valuation) {
    await valuationRepository.insert(response.valuation).catch((err) => {
      if (err.code !== 'SQLITE_CONSTRAINT') {
        throw err;
      }
    });
  }
  return response.valuation;
}

export async function findValuation(
  vrm: string,
  fastifyInstance: FastifyInstance,
): Promise<VehicleValuation | null> {

  const valuationRepository = fastifyInstance.orm.getRepository(VehicleValuation);
  return await valuationRepository.findOneBy({ vrm });
}

async function logResponse (response: VehicleValuationApiResponse,
                            fastifyInstance: FastifyInstance, ) {
  const providerLogsRepository = fastifyInstance.orm.getRepository(ProviderLogs);
  await providerLogsRepository.insert(response.audit).catch((err) => {
    if (err.code !== 'SQLITE_CONSTRAINT') {
      throw err;
    }
  });
}