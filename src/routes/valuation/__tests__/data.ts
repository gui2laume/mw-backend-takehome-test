export const superCarValuationStubResponse = {
  "vin": "2HSCNAPRX7C385251",
  "registrationDate": "2012-06-14T00:00:00.0000000",
  "plate": {
    "year": 2012,
    "month": 4
  },
  "valuation": {
    "lowerValue": 22350,
    "upperValue": 24750
  }
}

export const vehicleValuationStub = {
  "vrm": "ABC123",
  "lowestValue":22350,
  "highestValue":24750,
  "midpointValue":23550,
  "provider":"PROVIDER"
}

export const premiumCarValuationResponseStub : string = `
<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <RegistrationDate>2012-06-14T00:00:00.0000000</RegistrationDate>
  <RegistrationYear>2001</RegistrationYear>
  <RegistrationMonth>10</RegistrationMonth>
  <ValuationPrivateSaleMinimum>11500</ValuationPrivateSaleMinimum>
  <ValuationPrivateSaleMaximum>12750</ValuationPrivateSaleMaximum>
  <ValuationDealershipMinimum>9500</ValuationDealershipMinimum>
  <ValuationDealershipMaximum>10275</ValuationDealershipMaximum>
</root>`