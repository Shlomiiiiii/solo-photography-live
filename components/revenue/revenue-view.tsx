"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { BarChart3, CalendarDays, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import type { Gallery, Transaction } from "@/lib/types";
import { formatCurrency, formatDate, normalizeDate } from "@/lib/utils";

export function RevenueView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  useEffect(() => {
    const unsubTransactions = onSnapshot(query(collection(db, COLLECTIONS.transactions), orderBy("createdAt", "desc"), limit(500)), (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Transaction));
    });
    const unsubGalleries = onSnapshot(query(collection(db, COLLECTIONS.galleries), orderBy("createdAt", "desc"), limit(500)), (snapshot) => {
      setGalleries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Gallery));
    });
    return () => {
      unsubTransactions();
      unsubGalleries();
    };
  }, []);

  const paidTransactions = transactions.filter((item) => item.status === "paid");
  const totalRevenue = paidTransactions.reduce((sum, item) => sum + item.amountCents, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = paidTransactions
    .filter((item) => normalizeDate(item.createdAt)?.toISOString().slice(0, 7) === currentMonth)
    .reduce((sum, item) => sum + item.amountCents, 0);
  const pending = galleries.filter((gallery) => gallery.paymentRequired && !gallery.isPaid).reduce((sum, gallery) => sum + gallery.amountCents, 0);
  const paidGalleries = galleries.filter((gallery) => gallery.isPaid).length;

  const monthBuckets = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const transaction of paidTransactions) {
      const date = normalizeDate(transaction.createdAt);
      const key = date ? date.toISOString().slice(0, 7) : "Unknown";
      buckets.set(key, (buckets.get(key) ?? 0) + transaction.amountCents);
    }
    return Array.from(buckets.entries()).slice(0, 8);
  }, [paidTransactions]);

  const maxBucket = Math.max(...monthBuckets.map(([, amount]) => amount), 1);

  return (
    <div className="grid gap-5">
      <section>
        <p className="text-sm uppercase tracking-[0.24em] text-white/35">Revenue</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Studio revenue intelligence</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Collected payments, pending unlocks, paid galleries, and recent transaction flow.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <TrendingUp className="h-5 w-5 text-white/45" />
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-white/45">Total revenue</p>
        </Card>
        <Card className="p-5">
          <CalendarDays className="h-5 w-5 text-white/45" />
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(monthlyRevenue)}</p>
          <p className="text-sm text-white/45">Monthly revenue</p>
        </Card>
        <Card className="p-5">
          <CreditCard className="h-5 w-5 text-white/45" />
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(pending)}</p>
          <p className="text-sm text-white/45">Pending payments</p>
        </Card>
        <Card className="p-5">
          <BarChart3 className="h-5 w-5 text-white/45" />
          <p className="mt-3 text-3xl font-semibold text-white">{paidGalleries}</p>
          <p className="text-sm text-white/45">Paid galleries</p>
        </Card>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold text-white">Monthly revenue</h3>
              <p className="text-sm text-white/45">Last recorded payment months.</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {monthBuckets.map(([month, amount]) => (
              <div key={month} className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/65">{month}</span>
                  <span className="font-medium text-white">{formatCurrency(amount)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(8, (amount / maxBucket) * 100)}%` }} />
                </div>
              </div>
            ))}
            {!monthBuckets.length ? <p className="text-sm text-white/45">Revenue chart will populate after Stripe webhook payments arrive.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold text-white">Recent transactions</h3>
              <p className="text-sm text-white/45">Latest payment events.</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {paidTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="rounded-2xl bg-white/[0.055] p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{formatCurrency(transaction.amountCents, transaction.currency.toUpperCase())}</p>
                  <span className="text-xs text-success">Paid</span>
                </div>
                <p className="mt-1 truncate text-xs text-white/45">{transaction.customerEmail || transaction.stripePaymentIntentId}</p>
                <p className="mt-1 text-xs text-white/35">{formatDate(transaction.createdAt, "Recent")}</p>
              </div>
            ))}
            {!paidTransactions.length ? <p className="text-sm text-white/45">No paid transactions yet.</p> : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

