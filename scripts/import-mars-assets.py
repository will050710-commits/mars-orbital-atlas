"""Import supplied Mars ZIP assets, existing orbiter GLB, terrain GLB geometry, and baked 8K WebP maps."""
import hashlib
import json
import shutil
import struct
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NASA_TERMS = 'https://www.nasa.gov/nasa-brand-center/images-and-media/'

ZIP_MODELS = [
    (
        'sojourner_rover',
        'Sojourner',
        'Rover',
        'https://sketchfab.com/3d-models/mars-sojourner-rover-model-8b3810e7cd804bd6b0009520c67984c6',
        'Dan / danthemodeler; Ngee Ann Polytechnic (attribution in supplied ZIP)',
        'CC BY 4.0',
        'https://creativecommons.org/licenses/by/4.0/',
        {'lat': 19.13, 'lon': 326.78},
    ),
    (
        'spirit_and_opportunity_rover',
        'Spirit / Opportunity',
        'Rover',
        'https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/',
        'NASA/JPL-Caltech',
        'NASA media usage guidelines',
        NASA_TERMS,
        {'lat': -14.57, 'lon': 175.47},
    ),
    (
        'viking_lander',
        'Viking landers',
        'Lander',
        'https://science.nasa.gov/3d-resources/viking-lander/',
        'NASA/Michael D. Carbajal (source page); NASA/JPL-Caltech (supplied ZIP)',
        'NASA media usage guidelines',
        NASA_TERMS,
        {'lat': 22.27, 'lon': 312.05},
    ),
    (
        'insight_lander',
        'InSight',
        'Lander',
        'https://science.nasa.gov/resource/insight-lander-3d-model/',
        'NASA/JPL-Caltech',
        'NASA media usage guidelines',
        NASA_TERMS,
        {'lat': 4.502, 'lon': 135.623},
    ),
    (
        'ingenuity_helicopter',
        'Ingenuity',
        'Helicopter',
        'https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/',
        'NASA/Brian E. Kumanchik (source page); NASA/JPL-Caltech (supplied ZIP)',
        'NASA media usage guidelines',
        NASA_TERMS,
        {'lat': 18.38, 'lon': 77.58},
    ),
    (
        'dawn_spacecraft',
        'Dawn Spacecraft',
        'Orbiter / Probe',
        'https://science.nasa.gov/3d-resources/dawn/',
        'NASA/JPL-Caltech (supplied ZIP)',
        'NASA media usage guidelines',
        NASA_TERMS,
        None,
    ),
    (
        'near_shoemaker',
        'NEAR Shoemaker',
        'Orbiter / Probe',
        'https://science.nasa.gov/3d-resources/near-shoemaker/',
        'NASA/JPL-Caltech (supplied ZIP)',
        'NASA media usage guidelines',
        NASA_TERMS,
        None,
    ),
    (
        'pioneer_10',
        'Pioneer 10',
        'Spacecraft',
        'https://science.nasa.gov/3d-resources/pioneer/',
        'NASA/JPL-Caltech (supplied ZIP)',
        'NASA media usage guidelines',
        NASA_TERMS,
        None,
    ),
    (
        'kepler_space_telescope',
        'Kepler Space Telescope',
        'Space Telescope',
        'https://science.nasa.gov/3d-resources/kepler-a/',
        'NASA/JPL-Caltech (supplied ZIP)',
        'NASA media usage guidelines',
        NASA_TERMS,
        None,
    ),
]

APOLLO_SOURCE = dict(
    title='Apollo equipment notes (supplied CSV)',
    url='/assets/provenance/apollo-equipment.csv',
    checked='2026-11-14',
    version='User-supplied notes; undated',
)
APOLLO_EVIDENCE = 'Thitb-Tiliunndng-Nidungclichothitkgcnhn (2).csv'
APOLLO_CREDIT = 'NASA / Lunar and Planetary Institute references named in supplied device notes'

MOON_DEVICES = [
    (
        'apollo_lrv',
        'Lunar Roving Vehicle (LRV)',
        'Rover',
        'Sổ tay vận hành, hệ thống, sơ đồ bố trí thiết bị, camera TV, ăng-ten, tay điều khiển và hệ thống dẫn đường của LRV.',
        'apollo_lrv',
        {'lat': 26.1322, 'lon': 3.6339},
    ),
    (
        'apollo_lrv_deployment',
        'LRV deployment mechanism & chassis',
        'Cơ cấu triển khai',
        'Cơ cấu triển khai, khung xe, 4 bánh dẫn động độc lập, hệ thống treo và 2 pin silver-zinc.',
        'apollo_lrv_deploy',
        {'lat': 26.1322, 'lon': 3.6339},
    ),
    (
        'apollo_15_lrv',
        'LRV Apollo 15',
        'Rover',
        'LRV-1: cấu hình ghế lái, bảng điều khiển, camera và thiết bị gắn ngoài theo sổ tay hệ thống Apollo 15.',
        'apollo_lrv',
        {'lat': 26.1322, 'lon': 3.6339},
    ),
    (
        'apollo_17_lrv',
        'LRV Apollo 17',
        'Rover',
        'LRV-3: khác biệt về thiết bị địa chất và bố trí phía sau so với Apollo 15 theo sổ tay hệ thống Apollo 17.',
        'apollo_lrv',
        {'lat': 20.1908, 'lon': 30.7717},
    ),
    (
        'apollo_surface_equipment',
        'Apollo surface equipment',
        'Thiết bị bề mặt',
        'Danh mục tài liệu cho Modular Equipment Transporter (MET), bộ đồ EVA, dụng cụ lấy mẫu, hệ thống dẫn đường LRV và thiết bị Apollo khác.',
        'apollo_surface_pack',
        {'lat': -3.6453, 'lon': 342.5283},
    ),
    (
        'apollo_lm_equipment',
        'Lunar Module MESA & attached equipment',
        'Thiết bị Lunar Module',
        'Sơ đồ MESA, camera TV, ăng-ten S-band, thí nghiệm khoa học, hộp mẫu và cơ cấu triển khai gắn với Lunar Module.',
        'apollo_lm_mesa',
        {'lat': 0.6741, 'lon': 23.473},
    ),
]


def validate_glb_bytes(data: bytes, check_cc_by=False):
    magic, version, length, json_length, chunk_type = struct.unpack_from('<5I', data)
    assert magic == 0x46546C67 and version == 2 and length == len(data)
    assert chunk_type == 0x4E4F534A
    doc = json.loads(data[20:20 + json_length])
    assert doc.get('meshes') and doc.get('scenes')
    assert not any(
        item.get('uri') for item in doc.get('buffers', []) + doc.get('images', [])
    ), 'External dependencies require separate review'
    if check_cc_by:
        assert 'CC-BY-4.0' in doc['asset']['extras']['license']
    return doc


def base_record(asset_id, name, kind, source_url, credit, license_label, license_url):
    return dict(
        id=asset_id,
        bodyId='mars',
        name=name,
        kind=kind,
        summary='Mô hình tham khảo hình dáng; không mô phỏng vận hành hay xác nhận tỉ lệ vật lý.',
        evidence='Mars-20261114T010556Z-1-001.zip / Mars/Attributions.txt',
        source=dict(
            title=name,
            url=source_url,
            checked='2026-11-14',
            version='Supplied ZIP; original GLB bytes',
        ),
        credit=credit,
        license=dict(label=license_label, url=license_url, checked='2026-11-14'),
        units='glTF meters convention; physical dimensions unverified',
        transform=dict(rotation=[0, 0, 0], normalization='fit-longest-side-2', physicalScaleVerified=False),
        version='1.0.0',
    )


def moon_record(asset_id, name, kind, detail, procedural_model, coords):
    return dict(
        id=asset_id,
        bodyId='moon',
        name=name,
        kind=kind,
        summary='Có trong tài liệu; không có GLB Mặt Trăng được cung cấp và xác minh. ' + detail,
        evidence=APOLLO_EVIDENCE,
        source=APOLLO_SOURCE,
        credit=APOLLO_CREDIT,
        license=dict(label='No model supplied', url='', checked='2026-11-14'),
        units='Không có mô hình 3D gốc; hỗ trợ mô hình tái dựng minh họa & buồng điều khiển POV.',
        transform=dict(rotation=[0, 0, 0], normalization='fit-longest-side-2', physicalScaleVerified=False),
        version='1.0.0',
        status='unavailable',
        proceduralModel=procedural_model,
        coordinates=coords,
    )


def import_mars_terrain_and_textures():
    tex_dir = ROOT / 'public/assets/textures'
    tex_dir.mkdir(parents=True, exist_ok=True)
    for filename in ('mars_albedo_baked.webp', 'mars_normals.webp', 'mars_roughness.webp'):
        src = Path('D:/') / filename
        if src.exists():
            shutil.copy2(src, tex_dir / filename)
            print(f'Copied texture {filename} -> {tex_dir / filename}')

    terrain_src = Path('D:/mars_terrain.glb')
    if not terrain_src.exists():
        return
    raw = terrain_src.read_bytes()
    magic, version, total_len, json_len, json_type = struct.unpack_from('<5I', raw)
    assert magic == 0x46546C67 and version == 2 and json_type == 0x4E4F534A
    doc = json.loads(raw[20:20 + json_len])

    bin_hdr_offset = 20 + json_len
    bin_len, bin_type = struct.unpack_from('<2I', raw, bin_hdr_offset)
    assert bin_type == 0x004E4942
    bin_start = bin_hdr_offset + 8

    # Keep only bufferViews 0..3 (POSITION, NORMAL, TEXCOORD_0, INDICES) = 455,340 bytes
    geom_views = doc['bufferViews'][:4]
    geom_byte_len = max(v['byteOffset'] + v['byteLength'] for v in geom_views)
    pad_geom = (4 - (geom_byte_len % 4)) % 4
    geom_bin = raw[bin_start:bin_start + geom_byte_len] + (b'\x00' * pad_geom)

    clean_doc = {
        'asset': doc['asset'],
        'scene': 0,
        'scenes': doc['scenes'],
        'nodes': doc['nodes'],
        'meshes': doc['meshes'],
        'materials': [
            {
                'name': 'MarsTerrainMaterial',
                'doubleSided': True,
                'pbrMetallicRoughness': {'metallicFactor': 0, 'roughnessFactor': 0.9},
            }
        ],
        'accessors': doc['accessors'],
        'bufferViews': geom_views,
        'buffers': [{'byteLength': len(geom_bin)}],
    }
    clean_json = json.dumps(clean_doc, separators=(',', ':')).encode('utf-8')
    pad_json = (4 - (len(clean_json) % 4)) % 4
    clean_json += b' ' * pad_json

    out_total = 12 + 8 + len(clean_json) + 8 + len(geom_bin)
    out_bytes = (
        struct.pack('<3I', 0x46546C67, 2, out_total)
        + struct.pack('<2I', len(clean_json), 0x4E4F534A)
        + clean_json
        + struct.pack('<2I', len(geom_bin), 0x004E4942)
        + geom_bin
    )
    terrain_dst = ROOT / 'public/assets/models/mars/mars_terrain.glb'
    terrain_dst.parent.mkdir(parents=True, exist_ok=True)
    terrain_dst.write_bytes(out_bytes)
    print(f'Extracted geometry-only terrain mesh ({len(out_bytes)} bytes) -> {terrain_dst}')


def main():
    records = []
    with zipfile.ZipFile(sys.argv[1]) as archive:
        for asset_id, name, kind, source_url, credit, lic_label, lic_url, coords in ZIP_MODELS:
            record = base_record(asset_id, name, kind, source_url, credit, lic_label, lic_url)
            filename = asset_id + '.glb'
            data = archive.read('Mars/' + filename)
            validate_glb_bytes(data, check_cc_by=(asset_id == 'sojourner_rover'))
            destination = ROOT / 'public/assets/models/mars' / filename
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
            record.update(
                status='available',
                modelPath='/assets/models/mars/' + filename,
                bytes=len(data),
                sha256=hashlib.sha256(data).hexdigest(),
                attributionPath='/assets/attribution/Mars-Attributions.txt',
            )
            if coords:
                record['coordinates'] = coords
            records.append(record)

        attribution = ROOT / 'public/assets/attribution/Mars-Attributions.txt'
        attribution.parent.mkdir(parents=True, exist_ok=True)
        attribution.write_bytes(archive.read('Mars/Attributions.txt'))

    # Register existing on-disk MRO orbiter GLB into verified Mars path for catalog parity
    mro_src = ROOT / 'public/assets/models/spacecraft/mars_reconnaissance_orbiter.glb'
    if mro_src.exists():
        mro_data = mro_src.read_bytes()
        mro_dst = ROOT / 'public/assets/models/mars/mro_orbiter.glb'
        mro_dst.write_bytes(mro_data)
        mro_rec = base_record(
            'mro_orbiter',
            'Mars Reconnaissance Orbiter (MRO)',
            'Orbiter',
            'https://mars.nasa.gov/mro/',
            'NASA/JPL-Caltech (workspace spacecraft GLB)',
            'NASA media usage guidelines',
            NASA_TERMS,
        )
        mro_rec['evidence'] = 'public/assets/models/spacecraft/mars_reconnaissance_orbiter.glb'
        mro_rec['source']['version'] = 'Repository Draco GLB asset'
        mro_rec.update(
            status='available',
            modelPath='/assets/models/mars/mro_orbiter.glb',
            bytes=len(mro_data),
            sha256=hashlib.sha256(mro_data).hexdigest(),
        )
        records.append(mro_rec)

    for asset_id, name, proc_kind, coords in [
        ('curiosity_rover', 'Curiosity', 'mars_rover_rtg', {'lat': -4.5895, 'lon': 137.4417}),
        ('perseverance_rover', 'Perseverance', 'mars_rover_rtg', {'lat': 18.38, 'lon': 77.58}),
    ]:
        record = base_record(asset_id, name, 'Rover', '', 'NASA references named in supplied device notes', 'No model supplied', '')
        record.update(
            status='unavailable',
            proceduralModel=proc_kind,
            coordinates=coords,
        )
        record['summary'] = 'Có trong tài liệu; chưa có GLB NASA gốc xác minh. Hỗ trợ mô hình 3D tái dựng minh họa & góc nhìn buồng điều khiển.'
        record['evidence'] = 'Thitb-Tiliunndng-Nidungclichothitkgcnhn (1).csv'
        record['source'] = dict(
            title=record['evidence'],
            url='/assets/provenance/mars-rovers.csv',
            checked='2026-11-14',
            version='User-supplied notes; undated',
        )
        records.append(record)

    records.extend(moon_record(*entry) for entry in MOON_DEVICES)
    (ROOT / 'src/config/deviceManifest.json').write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    import_mars_terrain_and_textures()
    print(f'Imported {len(ZIP_MODELS) + 1} available GLBs; {len(records)} catalog records.')


if __name__ == '__main__':
    main()
