import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DELIVERY_FEE } from '../components/patient/constants';

const PatientContext = createContext(null);

const usePersistedState = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback((value) => {
    setState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  return [state, set];
};

export const PatientProvider = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [cart, setCart] = usePersistedState('teryaq_cart', []);
  const [favorites, setFavorites] = usePersistedState('teryaq_favs', []);
  const [recentOrders, setRecentOrders] = usePersistedState('teryaq_orders', []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('كاش عند الاستلام');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const addToCart = useCallback((item) => {
    if (Number(item.stock) <= 0) {
      showToast('عذراً، هذا الدواء غير متوفر حالياً', 'warning');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          showToast('وصلت للحد الأقصى المتاح', 'warning');
          return prev;
        }
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`تمت إضافة ${item.name} ✓`, 'success');
  }, [setCart, showToast]);

  const removeFromCart = useCallback((id) => setCart((p) => p.filter((i) => i.id !== id)), [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('تم إفراغ السلة', 'info');
  }, [setCart, showToast]);

  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const qty = Math.max(1, item.quantity + delta);
      if (delta > 0 && qty > item.stock) {
        showToast('لا يوجد مخزون كافٍ', 'warning');
        return item;
      }
      return { ...item, quantity: qty };
    }));
  }, [setCart, showToast]);

  const toggleFavorite = useCallback((id) => {
    const isFav = favorites.includes(id);
    setFavorites((prev) => isFav ? prev.filter((f) => f !== id) : [...prev, id]);
    showToast(isFav ? 'تم الحذف من المفضلة' : 'تمت الإضافة للمفضلة ❤️', 'info');
  }, [favorites, setFavorites, showToast]);

  const handleCheckout = useCallback(async () => {
    if (!cart.length || checkoutLoading) return;
    setCheckoutLoading(true);

    const orderId = `ORD-${String(Date.now()).slice(-5)}`;
    const pharmacyId = cart.find((i) => i.pharmacyId)?.pharmacyId || null;

    const newOrder = {
      orderId,
      items: cart.map(({ id, name, price, quantity, category }) => ({ id, name, price, quantity, category })),
      total: cartTotal + DELIVERY_FEE,
      status: 'pending',
      date: new Date().toLocaleString('ar-EG'),
      payment: paymentMethod,
      pharmacyId,
      patientName: user?.displayName || 'مريض',
    };

    try {
      await addDoc(collection(db, 'orders'), {
        ...newOrder,
        userId: user?.uid ?? 'guest',
        createdAt: serverTimestamp(),
      });
    } catch {
      showToast('تم حفظ الطلب محلياً — تحقق من الاتصال', 'warning');
    }

    setRecentOrders((p) => [newOrder, ...p]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCurrentOrder(newOrder);
    setCheckoutLoading(false);
    setIsTrackingOpen(true);
    showToast('تم إرسال طلبك بنجاح 🚀', 'success');
  }, [cart, cartTotal, checkoutLoading, paymentMethod, user, setCart, setRecentOrders, showToast]);

  const value = useMemo(() => ({
    cart, cartTotal, cartCount, favorites, recentOrders,
    isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen,
    isTrackingOpen, setIsTrackingOpen,
    currentOrder, setCurrentOrder,
    paymentMethod, setPaymentMethod,
    checkoutLoading,
    toast,
    addToCart, removeFromCart, clearCart, updateQuantity,
    toggleFavorite, handleCheckout, showToast,
  }), [
    cart, cartTotal, cartCount, favorites, recentOrders,
    isCartOpen, isCheckoutOpen, isTrackingOpen, currentOrder,
    paymentMethod, checkoutLoading, toast,
    addToCart, removeFromCart, clearCart, updateQuantity,
    toggleFavorite, handleCheckout, showToast,
  ]);

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
};
