import { test, expect, type Page } from '@playwright/test';

const moonDevices = [
  'Lunar Roving Vehicle (LRV)',
  'LRV deployment mechanism & chassis',
  'LRV Apollo 15',
  'LRV Apollo 17',
  'Apollo surface equipment',
  'Lunar Module MESA & attached equipment',
];

const buttonContaining = (page: Page, label: string) =>
  page.getByRole('button', { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });

test('Moon globe, sourced POIs and six documented Apollo records without GLB requests', async ({ page }) => {
  const errors: string[] = [];
  const models: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (request.url().endsWith('.glb')) models.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mars');
  await page.getByRole('button', { name: 'Mặt Trăng · Moon' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Moon');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('Globe minh họa · chưa có ảnh / địa hình đo đạc')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ảnh bề mặt · unavailable' })).toBeDisabled();
  expect(models).toEqual([]);

  await page.getByRole('button', { name: /Mare Tranquillitatis/ }).click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('8.35°');
  await expect(page.getByRole('link', { name: 'IAU / USGS · Mare Tranquillitatis' }))
    .toHaveAttribute('href', 'https://planetarynames.wr.usgs.gov/Feature/3691');
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();

  await buttonContaining(page, 'Tycho').click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('-43.30°');
  await expect(page.getByRole('link', { name: 'IAU / USGS · Tycho' }))
    .toHaveAttribute('href', 'https://planetarynames.wr.usgs.gov/Feature/6163');
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();

  await page.getByRole('button', { name: /South Pole–Aitken/ }).click();
  const panel = page.getByLabel('Thông tin và nguồn');
  await expect(panel).toContainText('-53.00°');
  await expect(panel).toContainText('không phải tâm địa danh do IAU xác lập');
  await expect(page.getByRole('link', { name: "NASA Science · The Moon's Largest Basin" }))
    .toHaveAttribute('href', 'https://science.nasa.gov/resource/the-moons-largest-basin/');
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
  await page.screenshot({ path: 'test-results/moon-globe.png' });

  for (const name of moonDevices) {
    await buttonContaining(page, name).click();
    await expect(page.getByTestId('model-status')).toHaveText('Chưa có mô hình 3D được xác minh');
    await expect(panel).toContainText('Hồ sơ thiết bị từ tài liệu cung cấp');
    await expect(panel).not.toContainText('Tệp ghi công gốc');
    await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
  }
  expect(models).toEqual([]);
  expect(errors).toEqual([]);
});

test('Mars → Moon → Mars switching resets body state and keeps both globes usable', async ({ page }) => {
  await page.goto('/');
  await buttonContaining(page, 'Viking landers').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });

  await page.getByRole('button', { name: 'Mặt Trăng · Moon' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Moon');
  await expect(page.getByTestId('model-status')).toHaveCount(0);
  const panel = page.getByLabel('Thông tin và nguồn');
  await expect(panel).toContainText('1.737,4 km');
  await expect(buttonContaining(page, 'Viking landers')).toHaveCount(0);

  await buttonContaining(page, 'Tycho').click();
  await expect(panel).toContainText('-43.30°');

  await page.getByRole('button', { name: 'Sao Hỏa · Mars' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mars');
  await expect(panel).toContainText('3.389,5 km');
  await expect(buttonContaining(page, 'Tycho')).toHaveCount(0);
  await buttonContaining(page, 'Viking landers').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
  await expect(page.locator('canvas')).toBeVisible();
});

test('a failed Mars model does not block the Moon and remains recoverable', async ({ page }) => {
  const model = '**/assets/models/mars/viking_lander.glb';
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(model, (route) => route.fulfill({ status: 404 }));
  await page.goto('/');
  await buttonContaining(page, 'Viking landers').click();
  await expect(page.getByRole('alert')).toContainText('missing-file');

  await page.getByRole('button', { name: 'Mặt Trăng · Moon' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Moon');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: /Mare Tranquillitatis/ }).click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('8.35°');
  await buttonContaining(page, 'Lunar Roving Vehicle (LRV)').click();
  await expect(page.getByTestId('model-status')).toHaveText('Chưa có mô hình 3D được xác minh');

  await page.unroute(model);
  await page.getByRole('button', { name: 'Sao Hỏa · Mars' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mars');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await buttonContaining(page, 'Viking landers').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  expect(errors).toEqual([]);
});

test('narrow viewport keeps the Moon canvas, records and unavailable layers usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mặt Trăng · Moon' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  const device = buttonContaining(page, 'LRV Apollo 15');
  await device.scrollIntoViewIfNeeded();
  await device.click();
  const panel = page.getByLabel('Thông tin và nguồn');
  await panel.scrollIntoViewIfNeeded();
  await expect(page.getByTestId('model-status')).toContainText('Chưa có mô hình');
  await expect(page.getByRole('button', { name: 'Địa hình / độ cao · unavailable' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'test-results/moon-mobile.png', fullPage: true });
});

test('switching from active Ingenuity controls to Moon clears device panel and resets controls on return', async ({ page }) => {
  const moonGlbRequests: string[] = [];
  let onMoon = false;
  page.on('request', (request) => {
    if (onMoon && request.url().endsWith('.glb')) moonGlbRequests.push(request.url());
  });

  await page.goto('/');
  await buttonContaining(page, 'Ingenuity').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await page.getByTestId('camera-view-rte_horizon').click();
  await page.getByTestId('part-group-cameras_optics').click();
  await page.getByTestId('rotor-spin-toggle').click();
  await expect(page.getByTestId('rotor-spin-toggle')).toHaveAttribute('aria-pressed', 'true');

  onMoon = true;
  await page.getByRole('button', { name: 'Mặt Trăng · Moon' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Moon');
  await expect(page.getByTestId('device-control-panel')).toHaveCount(0);
  await buttonContaining(page, 'Lunar Roving Vehicle (LRV)').click();
  await expect(page.getByTestId('model-status')).toHaveText('Chưa có mô hình 3D được xác minh');
  await expect(page.getByTestId('device-control-panel')).toHaveCount(0);
  expect(moonGlbRequests).toEqual([]);

  onMoon = false;
  await page.getByRole('button', { name: 'Sao Hỏa · Mars' }).click();
  await buttonContaining(page, 'Ingenuity').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await expect(page.getByTestId('camera-view-overview')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('part-group-all')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-step-0')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-spin-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('Moon orbital actors, Option 1 procedural Apollo LRV and Option 2 POV trigger zero GLB requests', async ({ page }) => {
  const errors: string[] = [];
  const moonGlbRequests: string[] = [];
  let onMoon = false;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (onMoon && request.url().endsWith('.glb')) moonGlbRequests.push(request.url());
  });

  await page.goto('/');
  onMoon = true;
  await page.getByRole('button', { name: 'Mặt Trăng · Moon' }).click();
  await expect(page.getByTestId('orbital-actor-lro_orbiter')).toBeVisible();
  await expect(page.getByTestId('orbital-actor-apollo_csm')).toBeVisible();

  await buttonContaining(page, 'Lunar Roving Vehicle (LRV)').click();
  await expect(page.getByTestId('view-mode-closeup')).toBeVisible();
  await page.getByTestId('view-mode-closeup').click();
  await expect(page.getByTestId('procedural-device-controls')).toBeVisible();

  await page.getByTestId('view-mode-pov').click();
  await expect(page.getByTestId('control-room-hud')).toBeVisible();
  await expect(page.getByTestId('pov-control-deck')).toBeVisible();
  await page.getByTestId('pov-sensor-NAVCAM_MONO').click();
  await expect(page.getByTestId('control-room-hud')).toContainText('NAVCAM MONO');

  await buttonContaining(page, 'Tycho').click();
  await page.getByTestId('view-mode-closeup').click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('Tycho');

  expect(moonGlbRequests).toEqual([]);
  expect(errors).toEqual([]);
});
