import { device, expect, element, by, waitFor } from 'detox';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have register screen', async () => {
    await expect(element(by.text('Create a new wallet'))).toExist();
  });
});
