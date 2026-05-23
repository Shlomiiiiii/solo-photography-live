"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { ArrowUpRight, Building2, CalendarClock, GalleryHorizontal, Plus, Search, Upload, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import type { Client, Gallery, Property, Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DashboardView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubClients = onSnapshot(query(collection(db, COLLECTIONS.clients), orderBy("fullNameLower", "asc"), limit(200)), (snapshot) => {
      setClients(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Client));
    });
    const unsubProperties = onSnapshot(query(collection(db, COLLECTIONS.properties), orderBy("sortZip", "asc"), limit(200)), (snapshot) => {
      setProperties(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Property));
    });
    const unsubGalleries = onSnapshot(query(collection(db, COLLECTIONS.galleries), orderBy("createdAt", "desc"), limit(200)), (snapshot) => {
      setGalleries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Gallery));
    });
    const unsubTransactions = onSnapshot(query(collection(db, COLLECTIONS.transactions), orderBy("createdAt", "desc"), limit(100)), (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Transaction));
    });

    return () => {
      unsubClients();
      unsubProperties();
      unsubGalleries();
      unsubTransactions();
    };
  }, []);

  const stats = useMemo(() => {
    const revenueCollectedCents = transactions.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amountCents, 0);
    const pendingPaymentsCents = galleries.filter((item) => item.paymentRequired && !item.isPaid).reduce((sum, item) => sum + item.amountCents, 0);
    return [
      { label: "Total clients", value: clients.length.toString(), icon: Users, href: "/clients" },
      { label: "Total properties", value: properties.length.toString(), icon: Building2, href: "/properties" },
      { label: "Total galleries", value: galleries.length.toString(), icon: GalleryHorizontal, href: "/galleries" },
      { label: "Revenue collected", value: formatCurrency(revenueCollectedCents), icon: WalletCards, href: "/revenue" },
      { label: "Pending payments", value: formatCurrency(pendingPaymentsCents), icon: CalendarClock, href: "/payments" },
      { label: "Recent uploads", value: galleries.filter((gallery) => gallery.photoCount > 0).length.toString(), icon: Upload, href: "/galleries" }
    ];
  }, [clients.length, galleries, properties.length, transactions]);

  const upcomingShoots = properties
    .filter((property) => property.shootDate && new Date(property.shootDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime())
    .slice(0, 5);

  const filteredClients = search
    ? clients.filter((client) => `${client.fullName} ${client.email}`.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : clients.slice(0, 5);

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/35">Studio overview</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">Luxury delivery, cleanly managed.</h2>
          </div>
          <div className="flex gap-2">
            <Link href="/clients?new=1">
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                Client
              </Button>
            </Link>
            <Link href="/galleries?new=1">
              <Button>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.045, type: "spring", stiffness: 260, damping: 24 }}
            >
              <Link href={stat.href}>
                <Card className="group h-full p-5 transition hover:border-white/20 hover:bg-white/[0.075]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/45">{stat.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white transition group-hover:bg-white group-hover:text-ink">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold text-white">Search clients</h3>
              <p className="mt-1 text-sm text-white/45">Instant access to contacts, shoots, and payment state.</p>
            </div>
            <Search className="h-5 w-5 text-white/35" />
          </CardHeader>
          <CardContent>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="luxury-focus mb-4 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white placeholder:text-white/35"
            />
            <div className="grid gap-2">
              {filteredClients.map((client) => (
                <Link key={client.id} href={`/clients/${client.id}`} className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 transition hover:bg-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{client.fullName}</p>
                    <p className="truncate text-xs text-white/45">{client.email}</p>
                  </div>
                  <Badge status={client.paymentStatus} />
                </Link>
              ))}
              {!filteredClients.length ? <EmptyState title="No clients yet" body="Add your first client to begin organizing properties, galleries, and payments." /> : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold text-white">Upcoming shoots</h3>
                <p className="mt-1 text-sm text-white/45">Sorted by shoot date.</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {upcomingShoots.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3 transition hover:bg-white/10">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">{property.address}</span>
                    <span className="block text-xs text-white/45">{formatDate(property.shootDate)}</span>
                  </span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-white/35" />
                </Link>
              ))}
              {!upcomingShoots.length ? <p className="rounded-2xl bg-white/[0.055] p-4 text-sm text-white/45">No upcoming shoots scheduled.</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold text-white">Recent uploads</h3>
                <p className="mt-1 text-sm text-white/45">Latest gallery activity.</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {galleries.slice(0, 5).map((gallery) => (
                <Link key={gallery.id} href={`/galleries/${gallery.id}`} className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 transition hover:bg-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{gallery.title}</p>
                    <p className="truncate text-xs text-white/45">{gallery.photoCount} photos</p>
                  </div>
                  <Badge status={gallery.status} />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
