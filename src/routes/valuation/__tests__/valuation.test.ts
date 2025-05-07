import { fastify } from '~root/test/fastify';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';
import { superCarValuationStubResponse, vehicleValuationStub } from './data';

import axios from 'axios';
import { afterEach, expect, MockInstance } from 'vitest';
import { VehicleValuation } from '@app/models/vehicle-valuation';

describe('ValuationController (e2e)', () => {
  let apiClient: MockInstance;
  let ormClient: MockInstance;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PUT /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/12345678',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        // @ts-expect-error intentionally malformed payload
        mileage: null,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is negative', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: -1,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 200 with valid request when vrm known in database', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      ormClient = vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(vehicleValuationStub),
      } as any);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(200);
    });

    it('should return 200 with valid request when vrm unknown in database but found by rest client', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      apiClient = vi
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: superCarValuationStubResponse });
      ormClient = vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(null),
        insert: vi.fn().mockResolvedValue({})
      } as any);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(200);
    });

  });

  describe('GET /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const res = await fastify.inject({
        url: '/valuations',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const res = await fastify.inject({
        url: '/valuations/12345678',
        method: 'GET',
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if VRM is unknown', async () => {
      ormClient = vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(null),
      } as any);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'GET',
      });
      expect(res.statusCode).toBe(404);
    });

    it('should fetch from database if VRM known', async () => {
      const vehicleValuation: VehicleValuation = vehicleValuationStub;

      ormClient = vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(vehicleValuation),
      } as any);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'GET',
      });

      expect(res.statusCode).toBe(200);
      const result = res.json() as VehicleValuation;
      expect(result.vrm).toBe(vehicleValuation.vrm);
      expect(result.lowestValue).toBe(vehicleValuation.lowestValue);
      expect(result.highestValue).toBe(vehicleValuation.highestValue);
      expect(result.midpointValue).toBe(vehicleValuation.midpointValue);
      expect(result.provider).toBe(vehicleValuation.provider);
    });

    it('should return 404 for unknown VRM', async () => {
      ormClient = vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
        findOneBy: vi.fn().mockResolvedValue(null),
      } as any);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'GET',
      });

      expect(res.statusCode).toBe(404);
    });
  });
});
