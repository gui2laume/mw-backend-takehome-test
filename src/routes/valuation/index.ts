import { FastifyInstance } from 'fastify';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { VehicleValuationResponse } from '@app/routes/valuation/types/vehicle-valuation-response';
import { fetchValuation, findValuation } from '@app/services/valuation-service';

export function valuationRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const { vrm } = request.params;

    if (vrm === null || vrm === '' || vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    const  result = await findValuation(vrm, fastify);

    if (result == null) {
      return reply
        .code(404)
        .send({
          message: `Valuation for VRM ${vrm} not found`,
          statusCode: 404,
        });
    }

    return result;
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const { vrm } = request.params;
    const { mileage } = request.body;

    if (vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    if (mileage === null || mileage <= 0) {
      return reply
        .code(400)
        .send({
          message: 'mileage must be a positive number',
          statusCode: 400,
        });
    }
    try {
      const valuation = await fetchValuation(vrm, mileage, fastify);
      const response: VehicleValuationResponse = new VehicleValuationResponse();
      if (valuation == null) {
        return reply
          .code(404)
          .send({
            message: `Valuation for VRM ${vrm} not found`,
            statusCode: 404,
          });
      }
      response.vrm = valuation.vrm;
      response.highestValue = valuation.highestValue;
      response.lowestValue = valuation.lowestValue;
      return response;
    } catch (e) {
      return reply
        .code(503)
        .send({
          message: 'Service Unavailable',
          statusCode: 503,
        });
    }
  });
}

