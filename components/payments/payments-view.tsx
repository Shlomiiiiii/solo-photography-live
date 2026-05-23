"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { CreditCard, ExternalLink, ReceiptText, Search, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageSkeleton } from "@/components/ui/skeleton";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import type { Gallery, Transaction } from "@/lib/types";
import { formatCurrency, formatDate, getBaseUrl } from "@/lib/utils";

export function PaymentsView() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubGalleries = onSnapshot(query(collection(db, COLLECTIONS.galleries), orderBy("createdAt", "desc"), limit(200)), (snapshot) => {
      setGalleries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Gallery));
      setLoading(false);
    });
    const unsubTransactions = onSnapshot(query(collection(db, COLLECTIONS.transactions), orderBy("createdAt", "desc"), limit(200)), (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Transaction));
    });
    return () => {
      unsubGalleries();
      unsubTransactions();
    };
  }, []);

  const pending = galleries.filter((gallery) => gallery.paymentRequired && !gallery.isPaid);
  const paid = galleries.filter((gallery) => gallery.isPaid);
  const filteredPending = useMemo(() => {
    const needle = search.toLowerCase();
    return pending.filter((gallery) => `${gallery.title} ${gallery.clientName} ${gallery.propertyAddress}`.toLowerCase().includes(needle));
  }, [pending, search]);

  const totalPending = pending.reduce((sum, gallery) => sum + gallery.amountCents, 0);
  const totalPaid = transactions.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amountCents, 0);

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/35">Payments</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Checkout and unlock state</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Monitor payment-gated galleries, Stripe confirmations, receipts, and access status.</p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input className="pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pending payments" />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <CreditCard className="h-5 w-5 text-white/45" />
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totalPending)}</p>
          <p className="text-sm text-white/45">Pending payments</p>
        </Card>
        <Card className="p-5">
          <ReceiptText className="h-5 w-5 text-white/45" />
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totalPaid)}</p>
          <p className="text-sm text-white/45">Collected</p>
        </Card>
        <Card className="p-5">
          <Unlock className="h-5 w-5 text-white/45" />
          <p className="mt-3 text-3xl font-semibold text-white">{paid.length}</p>
          <p className="text-sm text-white/45">Paid galleries</p>
        </Card>
      </div>

      {loading ? <PageSkeleton /> : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold text-white">Pending galleries</h3>
              <p className="text-sm text-white/45">Send secure links to collect payment.</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {filteredPending.map((gallery) => {
              const shareUrl = `${getBaseUrl()}/g/${gallery.token}`;
              return (
                <div key={gallery.id} className="flex flex-col gap-3 rounded-2xl bg-white/[0.055] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{gallery.title}</p>
                    <p className="truncate text-xs text-white/45">{gallery.clientName} · {formatCurrency(gallery.amountCents)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status="pending" />
                    <Link href={shareUrl} target="_blank">
                      <Button size="icon" variant="ghost" aria-label="Open client checkout">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            {!filteredPending.length ? <EmptyState title="No pending payments" body="All current payment-gated galleries are paid or unlocked." /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold text-white">Recent transactions</h3>
              <p className="text-sm text-white/45">Stripe webhook confirmations.</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {transactions.slice(0, 12).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{formatCurrency(transaction.amountCents, transaction.currency.toUpperCase())}</p>
                  <p className="truncate text-xs text-white/45">{transaction.customerEmail || transaction.stripeSessionId}</p>
                  <p className="text-xs text-white/35">{formatDate(transaction.createdAt, "Recent")}</p>
                </div>
                <Badge status={transaction.status} />
              </div>
            ))}
            {!transactions.length ? <p className="text-sm text-white/45">No transactions yet.</p> : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
