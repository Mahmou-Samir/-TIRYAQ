export const enrichMedicine = (raw) => ({
  price: 50,
  stock: 0,
  description: 'هذا الدواء يُستخدم تحت إشراف طبي.',
  dosage: 'استشر الطبيب أو الصيدلي للجرعة المناسبة.',
  activeIngredient: '',
  sideEffects: [],
  warnings: [],
  manufacturer: '',
  form: 'أقراص',
  alternatives: [],
  ...raw,
  price: Number(raw?.price ?? 50),
  stock: Number(raw?.stock ?? 0),
});

export const getMedicineOffers = (allMedicines, medicine) => {
  if (!medicine?.name) return [medicine].filter(Boolean);
  const key = medicine.name.toLowerCase().trim();
  const byName = allMedicines.filter((m) => m.name?.toLowerCase().trim() === key);
  if (byName.length > 1) return byName.sort((a, b) => a.price - b.price);
  if (medicine.activeIngredient) {
    const byIngredient = allMedicines.filter(
      (m) => m.activeIngredient && m.activeIngredient === medicine.activeIngredient,
    );
    if (byIngredient.length) return byIngredient.sort((a, b) => a.price - b.price);
  }
  return [medicine];
};

export const getAlternativeMedicines = (allMedicines, medicine) => {
  const ids = new Set(medicine?.alternatives || []);
  const fromIds = allMedicines.filter((m) => ids.has(m.id) && m.id !== medicine.id);
  if (fromIds.length) return fromIds;

  if (medicine?.activeIngredient) {
    return allMedicines.filter(
      (m) => m.id !== medicine.id
        && m.activeIngredient === medicine.activeIngredient
        && m.name?.toLowerCase() !== medicine.name?.toLowerCase(),
    ).slice(0, 4);
  }

  return allMedicines.filter(
    (m) => m.id !== medicine.id && m.category === medicine.category,
  ).slice(0, 3);
};

export const getCheapestOffer = (offers) => {
  if (!offers?.length) return null;
  return offers.reduce((min, o) => (o.price < min.price ? o : min), offers[0]);
};
