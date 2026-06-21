import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';
import {
  saveMedicine,
  deleteMedicine as deleteMedicineDb,
  recordSale as recordSaleDb,
  computeSalesStats,
  getSaleDisplayId,
} from '../utils/pharmacyService';

const PharmacyContext = createContext(null);

export const getOrderTotal = (order) => Number(order?.total ?? order?.totalPrice ?? 0);
export const getItemQty = (item) => item?.quantity ?? item?.qty ?? 1;
export const getOrderDisplayId = (order) => order?.orderId || `#${String(order?.id || '').slice(0, 6)}`;
export { getSaleDisplayId, computeSalesStats };

export const PharmacyProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pharmacy-read-notifs') || '[]');
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  }, []);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      setLoadingOrders(false);
      setLoadingMedicines(false);
      setLoadingSales(false);
      return undefined;
    }

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('pharmacyId', '==', uid), orderBy('createdAt', 'desc')),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingOrders(false);
      },
      () => {
        onSnapshot(query(collection(db, 'orders'), where('pharmacyId', '==', uid)), (snap) => {
          setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoadingOrders(false);
        });
      },
    );

    const unsubMeds = onSnapshot(
      query(collection(db, 'medicines'), where('pharmacyId', '==', uid), orderBy('updatedAt', 'desc')),
      (snap) => {
        setMedicines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingMedicines(false);
      },
      () => {
        onSnapshot(query(collection(db, 'medicines'), where('pharmacyId', '==', uid)), (snap) => {
          setMedicines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoadingMedicines(false);
        });
      },
    );

    const unsubSales = onSnapshot(
      query(collection(db, 'pharmacy_sales'), where('pharmacyId', '==', uid), orderBy('createdAt', 'desc')),
      (snap) => {
        setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingSales(false);
      },
      () => {
        onSnapshot(query(collection(db, 'pharmacy_sales'), where('pharmacyId', '==', uid)), (snap) => {
          setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoadingSales(false);
        });
      },
    );

    return () => {
      unsubOrders();
      unsubMeds();
      unsubSales();
    };
  }, []);

  const stats = useMemo(() => computeSalesStats(sales, orders), [sales, orders]);

  const todaySales = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return sales.filter((s) => {
      const d = s.createdAt?.toDate?.() || new Date(0);
      return d >= todayStart;
    });
  }, [sales]);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders],
  );

  const activeCount = useMemo(
    () => orders.filter((o) => ['pending', 'accepted', 'preparing'].includes(o.status)).length,
    [orders],
  );

  const lowStockCount = useMemo(
    () => medicines.filter((m) => Number(m.stock) < 10).length,
    [medicines],
  );

  const notifications = useMemo(() => {
    return orders
      .filter((o) => o.status === 'pending')
      .slice(0, 8)
      .map((o) => ({
        id: o.id,
        orderId: getOrderDisplayId(o),
        patientName: o.patientName,
        total: getOrderTotal(o),
        createdAt: o.createdAt?.toDate?.() || new Date(),
        read: readNotificationIds.includes(o.id),
      }));
  }, [orders, readNotificationIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    setReadNotificationIds(ids);
    localStorage.setItem('pharmacy-read-notifs', JSON.stringify(ids));
  }, [notifications]);

  const markRead = useCallback((id) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('pharmacy-read-notifs', JSON.stringify(next));
      return next;
    });
  }, []);

  const upsertMedicine = useCallback(async (form, existingId = null) => {
    const id = await saveMedicine(form, existingId);
    return id;
  }, []);

  const removeMedicine = useCallback(async (id) => {
    await deleteMedicineDb(id);
  }, []);

  const recordSale = useCallback(async (payload) => {
    const id = await recordSaleDb(payload);
    return id;
  }, []);

  const value = useMemo(() => ({
    orders,
    medicines,
    sales,
    todaySales,
    stats,
    loadingOrders,
    loadingMedicines,
    loadingSales,
    pendingCount,
    activeCount,
    lowStockCount,
    notifications,
    unreadCount,
    toast,
    showToast,
    markAllRead,
    markRead,
    upsertMedicine,
    removeMedicine,
    recordSale,
  }), [
    orders, medicines, sales, todaySales, stats,
    loadingOrders, loadingMedicines, loadingSales,
    pendingCount, activeCount, lowStockCount,
    notifications, unreadCount, toast,
    showToast, markAllRead, markRead,
    upsertMedicine, removeMedicine, recordSale,
  ]);

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error('usePharmacy must be used within PharmacyProvider');
  return ctx;
};
