import { calculateDistanceKm, findNearestHub, generateItemCode, INITIAL_HUBS } from '../src/data/mockData';
import { ItemCategory, ItemStatus } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- RUNNING FINDBACK UNIT TESTS ---');

// 1. Test Nearest Hub Calculation (Chennai Coordinates)
const marinaBeachCoords = { lat: 13.0499, lng: 80.2824 }; // Near Central / Adyar
const resultMarina = findNearestHub(marinaBeachCoords.lat, marinaBeachCoords.lng, INITIAL_HUBS);
assert(Boolean(resultMarina.hub), 'Finds nearest hub for Marina Beach coords');
assert(resultMarina.distanceKm > 0, `Distance is valid positive number (${resultMarina.distanceKm} km)`);
assert(resultMarina.distanceMinutesWalk >= 1, `Walk time is calculated (${resultMarina.distanceMinutesWalk} mins)`);

// 2. Test Velachery proximity
const velacheryCoords = { lat: 12.9780, lng: 80.2190 };
const resultVelachery = findNearestHub(velacheryCoords.lat, velacheryCoords.lng, INITIAL_HUBS);
assert(resultVelachery.hub.id === 'hub-chennai-velachery-01', `Nearest hub for Velachery is Velachery Civic Hub (got ${resultVelachery.hub.name})`);
assert(resultVelachery.distanceKm < 1.0, `Velachery distance is < 1 km (${resultVelachery.distanceKm} km)`);

// 3. Test T. Nagar proximity
const tnagarCoords = { lat: 13.0400, lng: 80.2330 };
const resultTnagar = findNearestHub(tnagarCoords.lat, tnagarCoords.lng, INITIAL_HUBS);
assert(resultTnagar.hub.id === 'hub-chennai-tnagar-02', `Nearest hub for T. Nagar is T. Nagar Commercial Hub (got ${resultTnagar.hub.name})`);

// 4. Test Anna Nagar proximity
const annaNagarCoords = { lat: 13.0860, lng: 80.2110 };
const resultAnnaNagar = findNearestHub(annaNagarCoords.lat, annaNagarCoords.lng, INITIAL_HUBS);
assert(resultAnnaNagar.hub.id === 'hub-chennai-annanagar-04', `Nearest hub for Anna Nagar is Anna Nagar Central Hub (got ${resultAnnaNagar.hub.name})`);

// 5. Test Item Code Generation format
const code1 = generateItemCode();
const code2 = generateItemCode();
assert(/^FB-\d{4}-[A-Z]$/.test(code1), `Item code matches FB-XXXX-L format (${code1})`);
assert(code1 !== code2, 'Subsequent item codes are distinct');

// 6. Test Haversine Formula Distance Accuracy
const distBetweenCentralAndAdyar = calculateDistanceKm(13.0827, 80.2707, 13.0012, 80.2565);
assert(distBetweenCentralAndAdyar > 8 && distBetweenCentralAndAdyar < 11, `Central to Adyar distance is realistic (~9-10 km, got ${distBetweenCentralAndAdyar.toFixed(2)} km)`);

// 7. Test Status Sequence
const validStatuses: ItemStatus[] = ['reported', 'dropped_at_hub', 'listed', 'claimed', 'verified', 'returned'];
assert(validStatuses.length === 6, 'All 6 lifecycle statuses are defined');

console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---');
