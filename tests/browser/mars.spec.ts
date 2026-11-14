import { test, expect, type Page } from '@playwright/test';

const buttonContaining = (page: Page, label: string) =>
  page.getByRole('button', { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });

const ORBITAL_MARS_GLBS = new Set([
  '/assets/models/moons/phobos.glb',
  '/assets/models/moons/deimos.glb',
  '/assets/models/mars/mro_orbiter.glb',
  '/assets/models/mars/mars_odyssey.glb',
  '/assets/models/mars/maven_orbiter.glb',
  '/assets/models/mars/dawn_spacecraft.glb',
  '/assets/models/stations/ares_orbital_station.glb',
]);

const ORBITAL_MOON_GLBS = new Set([
  '/assets/models/moons/lro_orbiter.glb',
  '/assets/models/moons/apollo_csm.glb',
]);

const SURFACE_MARS_GLBS = [
  '/assets/models/mars/viking_lander.glb',
  '/assets/models/mars/sojourner_rover.glb',
  '/assets/models/mars/spirit_and_opportunity_rover.glb',
  '/assets/models/mars/insight_lander.glb',
  '/assets/models/mars/ingenuity_helicopter.glb',
  '/assets/models/mars/curiosity_rover.glb',
  '/assets/models/mars/perseverance_rover.glb',
];

const pathFromUrl = (rawUrl: string) => new URL(rawUrl).pathname;

test('Mars globe, orbital GLBs, sourced POIs, lazy surface GLB models and Moon unavailable entries', async ({ page }) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  const models: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.url().endsWith('.glb')) models.push(pathFromUrl(request.url()));
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mars');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('Globe minh họa · chưa có ảnh / địa hình đo đạc')).toBeVisible();
  await expect.poll(() => new Set(models).size, { timeout: 30000 }).toBeGreaterThanOrEqual(7);
  expect(models.every((path) => ORBITAL_MARS_GLBS.has(path))).toBeTruthy();
  expect(models.some((path) => SURFACE_MARS_GLBS.includes(path))).toBeFalsy();
  await buttonContaining(page, 'Jezero').click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('18.41°');
  await expect(page.getByRole('link', { name: 'IAU / USGS · Jezero' })).toHaveAttribute('href', 'https://planetarynames.wr.usgs.gov/Feature/14300');
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
  await page.screenshot({ path: 'test-results/mars-globe.png' });
  for (const name of ['Viking landers', 'Sojourner', 'Spirit / Opportunity', 'InSight', 'Ingenuity', 'Curiosity', 'Perseverance']) {
    await buttonContaining(page, name).click();
    await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
    await expect(page.getByLabel('Thông tin và nguồn')).toContainText('Tỉ lệ vật lý');
    await page.screenshot({ path: 'test-results/mars-' + name.replace(/[^a-z0-9]/gi, '_') + '.png' });
  }
  await page.getByRole('button', { name: 'Mặt Trăng · Moon' }).click();
  await expect.poll(() => models.filter((path) => ORBITAL_MOON_GLBS.has(path)).length, { timeout: 30000 }).toBeGreaterThan(0);
  const countBeforeLrv = models.length;
  await buttonContaining(page, 'Lunar Roving Vehicle').click();
  await expect(page.getByTestId('model-status')).toContainText('Chưa có mô hình');
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('Hồ sơ thiết bị từ tài liệu cung cấp');
  await expect(page.getByLabel('Thông tin và nguồn')).not.toContainText('Tệp gốc không chỉnh sửa');
  expect(models.slice(countBeforeLrv)).toEqual([]);
  for (const path of SURFACE_MARS_GLBS) {
    expect(models).toContain(path);
  }
  expect(errors).toEqual([]);
});

test('repeated model inspection releases model geometries and textures', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/');
  const memory = () => page.evaluate(async () => {
    const modulePath = '/src/core/canvas/rendererDiagnostics.ts';
    return (await import(modulePath)).rendererMemory();
  });
  await expect.poll(async () => (await memory())?.geometries, { timeout: 15000 }).toBeGreaterThan(0);
  // Warm up one surface -> overview roundtrip and wait for overview orbital GLBs + baked textures to settle
  await buttonContaining(page, 'Viking landers').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
  await page.waitForTimeout(2000);
  const baseline = await memory();
  for (let i = 0; i < 3; i++) {
    await buttonContaining(page, 'Viking landers').click();
    await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
    await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
    await expect.poll(async () => (await memory())?.geometries, { timeout: 15000 }).toBeLessThanOrEqual(baseline.geometries + 4);
    await expect.poll(async () => (await memory())?.textures, { timeout: 15000 }).toBeLessThanOrEqual(baseline.textures + 2);
  }
});

test('missing model and malformed model remain recoverable', async ({ page }) => {
  const model = '**/assets/models/mars/viking_lander.glb';
  await page.route(model, (route) => route.fulfill({ status: 404 }));
  await page.goto('/');
  await buttonContaining(page, 'Viking landers').click();
  await expect(page.getByRole('alert')).toContainText('missing-file');
  await page.unroute(model);
  await page.route(model, (route) => route.fulfill({ body: '<html>SPA fallback</html>' }));
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('parse');
  await page.unroute(model);
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình');
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('Bán kính trung bình');
});

test('narrow viewport keeps canvas, navigation, unavailable layers and sources usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  const device = buttonContaining(page, 'Perseverance');
  await device.scrollIntoViewIfNeeded();
  await device.click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  const panel = page.getByLabel('Thông tin và nguồn');
  await panel.scrollIntoViewIfNeeded();
  await expect(page.getByTestId('device-control-panel')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'test-results/mars-mobile.png', fullPage: true });
});

test('Ingenuity device inspection exposes documented camera views, coaxial rotor controls and GLB subsystem limits', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');

  await buttonContaining(page, 'Ingenuity').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  const controlPanel = page.getByTestId('device-control-panel');
  await expect(controlPanel).toBeVisible();

  await expect(page.getByTestId('camera-view-overview')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('part-group-all')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-step-0')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-spin-toggle')).toHaveAttribute('aria-pressed', 'false');

  await page.getByTestId('camera-view-rte_horizon').click();
  await expect(page.getByTestId('camera-view-rte_horizon')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('active-camera-details')).toContainText('RTE 13 MP');
  await expect(page.getByTestId('active-camera-details')).toContainText('Góc nhìn minh họa');

  await page.getByTestId('camera-view-navcam_nadir').click();
  await expect(page.getByTestId('active-camera-details')).toContainText('Navcam 0,5 MP');

  await page.getByTestId('part-group-cameras_optics').click();
  await expect(page.getByTestId('part-group-cameras_optics')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('active-part-details')).toContainText('cams');
  await expect(page.getByTestId('active-part-details')).toContainText('Tĩnh · Chỉ quan sát');

  await page.getByTestId('part-group-landing_gear').click();
  await expect(page.getByTestId('active-part-details')).toContainText('leg_01, leg_02, leg_03, leg_04');
  await expect(page.getByTestId('active-part-details')).toContainText('Không tạo animation gập chân');

  await page.getByTestId('rotor-step-90').click();
  await expect(page.getByTestId('rotor-step-90')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('rotor-spin-toggle').click();
  await expect(page.getByTestId('rotor-spin-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-spin-toggle')).toContainText('Dừng quay minh họa');
  await expect(page.getByTestId('rotor-step-90')).toHaveAttribute('aria-pressed', 'false');

  await page.getByTestId('rotor-step-45').click();
  await expect(page.getByTestId('rotor-spin-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('rotor-step-45')).toHaveAttribute('aria-pressed', 'true');

  await page.screenshot({ path: 'test-results/mars-ingenuity-controls.png' });

  await page.getByTestId('device-control-reset').click();
  await expect(page.getByTestId('camera-view-overview')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('part-group-all')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-step-0')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-spin-toggle')).toHaveAttribute('aria-pressed', 'false');

  await buttonContaining(page, 'InSight').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await expect(page.getByTestId('device-control-panel')).toBeVisible();
  await page.getByTestId('part-group-robotic_arm').click();
  await expect(page.getByTestId('active-part-details')).toContainText('arm_01');
  await page.getByTestId('part-group-solar_wings').click();
  await expect(page.getByTestId('active-part-details')).toContainText('68 node');

  await buttonContaining(page, 'Viking landers').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await expect(page.getByTestId('device-control-panel')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Mars orbital actors, 8K terrain mesh and Option 1 / Option 2 flows work without errors', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  const requestedUrls: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    requestedUrls.push(request.url());
  });

  await page.goto('/');
  await expect(page.getByTestId('toggle-orbits-btn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('orbital-actor-phobos')).toBeVisible();
  await expect(page.getByTestId('orbital-actor-mro_orbiter')).toBeVisible();

  // Select orbital target & verify Option 1 (GLB Close-Up) + Option 2 (Control Room POV)
  await page.getByTestId('orbital-actor-mars_odyssey').click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('2001 Mars Odyssey');
  await expect(page.getByTestId('device-dossier-panel')).toContainText('24885_Odyssey.glb');
  await page.getByTestId('view-mode-closeup').click();
  await expect(page.getByTestId('view-mode-closeup')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('orbital-actor-phobos').click();
  await expect(page.getByLabel('Thông tin và nguồn')).toContainText('Phobos');
  await expect(page.getByTestId('dual-view-mode-switcher')).toBeVisible();
  await page.getByTestId('view-mode-closeup').click();
  await expect(page.getByTestId('view-mode-closeup')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('view-mode-pov').click();
  await expect(page.getByTestId('control-room-hud')).toBeVisible();
  await expect(page.getByTestId('pov-control-deck')).toBeVisible();
  await page.getByTestId('pov-yaw-right').click();
  await page.getByTestId('pov-zoom-2').click();
  await page.getByTestId('pov-sensor-THERMAL_FALSE').click();
  await expect(page.getByTestId('control-room-hud')).toContainText('HDG 015°');
  await expect(page.getByTestId('control-room-hud')).toContainText('ZOOM 2×');

  // Switch to Surface POI Jezero and test Option 1 (Terrain 3D Mesh) + Option 2 (POV over Mars Terrain Patch)
  await page.getByRole('button', { name: /Jezero/ }).click();
  await page.getByTestId('view-mode-closeup').click();
  await expect(page.getByTestId('terrain-mesh-banner')).toBeVisible();

  await page.getByTestId('view-mode-pov').click();
  await expect(page.getByTestId('pov-control-deck')).toBeVisible();
  await page.getByTestId('pov-sensor-ELEVATION_GRID').click();
  await expect(page.getByTestId('pov-sensor-ELEVATION_GRID')).toHaveAttribute('aria-pressed', 'true');

  // Switch back to Mars layer switcher & verify 3D terrain GLB + WebP were lazy-loaded on demand
  await page.getByRole('button', { name: 'Trở về toàn cảnh', exact: true }).click();
  await page.getByTestId('layer-btn-TERRAIN_MESH_3D').click();
  await expect(page.getByTestId('terrain-mesh-banner')).toBeVisible();
  expect(requestedUrls.some((url) => url.endsWith('/mars_terrain.glb'))).toBeTruthy();

  // Official NASA GLB rovers (Curiosity & Perseverance) lazy-load on demand with dossier + Option 1/Option 2 controls
  await buttonContaining(page, 'Curiosity').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await expect(page.getByTestId('dual-view-mode-switcher')).toBeVisible();
  await expect(page.getByTestId('device-control-panel')).toBeVisible();
  await expect(page.getByTestId('device-dossier-panel')).toBeVisible();
  await page.getByTestId('dossier-tab-contributions').click();
  await expect(page.getByTestId('dossier-section-contributions')).toContainText('Gale Crater');
  await page.getByTestId('dossier-tab-all').click();

  await buttonContaining(page, 'Perseverance').click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await expect(page.getByTestId('device-control-panel')).toBeVisible();
  await page.getByTestId('camera-view-mastcam_supercam').click();
  await page.getByTestId('part-group-robotic_arm').click();
  await expect(page.getByTestId('active-part-details')).toContainText('PIXL');
  await expect(page.getByTestId('device-dossier-panel')).toContainText('MOXIE');

  await page.getByTestId('view-mode-pov').click();
  await expect(page.getByTestId('pov-control-deck')).toBeVisible();
  await page.getByTestId('pov-action-arm').click();
  await expect(page.getByTestId('pov-arm-status')).toContainText('ARM DEPLOYED');
  await page.getByTestId('pov-action-scan').click();
  await expect(page.getByTestId('pov-scan-readout')).toBeVisible();
  await page.screenshot({ path: 'test-results/mars-pov-perseverance.png' });

  expect(errors).toEqual([]);
});

test('Ingenuity missing model hides control panel until retry succeeds', async ({ page }) => {
  const model = '**/assets/models/mars/ingenuity_helicopter.glb';
  await page.route(model, (route) => route.fulfill({ status: 404 }));
  await page.goto('/');
  await buttonContaining(page, 'Ingenuity').click();
  await expect(page.getByRole('alert')).toContainText('missing-file');
  await expect(page.getByTestId('device-control-panel')).toHaveCount(0);

  await page.unroute(model);
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });
  await expect(page.getByTestId('device-control-panel')).toBeVisible();
});

test('narrow viewport keeps Ingenuity control panel usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const device = buttonContaining(page, 'Ingenuity');
  await device.scrollIntoViewIfNeeded();
  await device.click();
  await expect(page.getByTestId('model-status')).toHaveText('Đã tải mô hình', { timeout: 60000 });

  const controlPanel = page.getByTestId('device-control-panel');
  await controlPanel.scrollIntoViewIfNeeded();
  await expect(controlPanel).toBeVisible();
  await page.getByTestId('camera-view-coaxial_mast').click();
  await page.getByTestId('part-group-rotor_system').click();
  await page.getByTestId('rotor-step-90').click();
  await expect(page.getByTestId('camera-view-coaxial_mast')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('part-group-rotor_system')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-step-90')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('rotor-step-90')).toHaveCSS('border-color', 'rgb(124, 218, 161)');
  await expect(page.getByTestId('active-part-details')).toContainText('rotors_01');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'test-results/mars-ingenuity-mobile.png', fullPage: true });
});
