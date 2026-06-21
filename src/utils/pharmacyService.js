import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

export const getPharmacyId = () => getAuth().currentUser?.uid || null;

export const generateSaleId = () => `SALE-${String(Date.now()).slice(-6)}`;

export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const startOfWeek = (date = new Date()) => {
  const d = startOfDay(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
};

export const buildSearchKeywords = (name = '', category = '') => [
  name.toLowerCase().trim(),
  category.toLowerCase().trim(),
].filter(Boolean);

export const normalizeMedicinePayload = (form, pharmacyId) => ({
  name: form.name.trim(),
  category: form.category.trim() || 'General',
  price: Number(form.price) || 0,
  costPrice: Number(form.costPrice) || 0,
  stock: Math.max(0, Number(form.stock) || 0),
  expiry: form.expiry || null,
  sku: form.sku?.trim() || '',
  barcode: form.barcode?.trim() || '',
  pharmacyId,
  searchKeywords: buildSearchKeywords(form.name, form.category),
  updatedAt: serverTimestamp(),
});

export async function saveMedicine(form, existingId = null) {
  const pharmacyId = getPharmacyId();
  if (!pharmacyId) throw new Error('Not authenticated');

  const payload = normalizeMedicinePayload(form, pharmacyId);

  if (existingId) {
    await updateDoc(doc(db, 'medicines', existingId), payload);
    return existingId;
  }

  const ref = await addDoc(collection(db, 'medicines'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMedicine(id) {
  await deleteDoc(doc(db, 'medicines', id));
}

export async function recordSale({ items, paymentMethod = 'cash', type = 'walk_in', orderId = null, note = '' }) {
  const pharmacyId = getPharmacyId();
  if (!pharmacyId) throw new Error('Not authenticated');
  if (!items?.length) throw new Error('No items');

  const normalizedItems = items.map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Number(item.unitPrice ?? item.price) || 0;
    const currentStock = Number(item.currentStock ?? item.stock ?? 0);
    return {
      medicineId: item.medicineId || item.id,
      name: item.name,
      quantity: qty,
      unitPrice,
      lineTotal: qty * unitPrice,
      currentStock,
    };
  });

  const total = normalizedItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const batch = writeBatch(db);

  normalizedItems.forEach((item) => {
    if (!item.medicineId) return;
    const medRef = doc(db, 'medicines', item.medicineId);
    batch.update(medRef, {
      stock: Math.max(0, item.currentStock - item.quantity),
      updatedAt: serverTimestamp(),
    });
  });

  const saleRef = doc(collection(db, 'pharmacy_sales'));
  batch.set(saleRef, {
    pharmacyId,
    saleId: generateSaleId(),
    items: normalizedItems.map(({ medicineId, name, quantity, unitPrice, lineTotal }) => ({
      medicineId, name, quantity, unitPrice, lineTotal,
    })),
    total,
    paymentMethod,
    type,
    orderId,
    note: note.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return saleRef.id;
}

export function computeSalesStats(sales = [], orders = []) {
  const todayStart = startOfDay();
  const weekStart = startOfWeek();
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);

  let todayRevenue = 0;
  let todayCount = 0;
  let todayItems = 0;
  let weekRevenue = 0;
  let monthRevenue = 0;
  let totalRevenue = 0;
  let totalProfit = 0;

  sales.forEach((sale) => {
    const date = sale.createdAt?.toDate?.() || new Date(sale.createdAt || 0);
    const total = Number(sale.total) || 0;
    totalRevenue += total;

    if (date >= todayStart) {
      todayRevenue += total;
      todayCount += 1;
      todayItems += (sale.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    }
    if (date >= weekStart) weekRevenue += total;
    if (date >= monthStart) monthRevenue += total;
  });

  orders.forEach((order) => {
    if (order.status !== 'completed') return;
    const date = order.createdAt?.toDate?.() || new Date(0);
    const total = Number(order.total ?? order.totalPrice ?? 0);
    if (date >= todayStart) {
      todayRevenue += total;
      todayCount += 1;
    }
    if (date >= weekStart) weekRevenue += total;
    if (date >= monthStart) monthRevenue += total;
    totalRevenue += total;
  });

  return {
    todayRevenue,
    todayCount,
    todayItems,
    weekRevenue,
    monthRevenue,
    totalRevenue,
    totalProfit,
    avgSale: todayCount ? Math.round(todayRevenue / todayCount) : 0,
  };
}

export function getSaleDisplayId(sale) {
  return sale?.saleId || `#${String(sale?.id || '').slice(0, 6)}`;
}
