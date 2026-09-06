import Link from "next/link";
import { ArrowRight, Search, Send, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  APP_DESCRIPTION,
  APP_TAGLINE,
  OPPORTUNITY_TYPES,
  OPPORTUNITY_TYPE_META,
} from "@/lib/constants";

const HOW_IT_WORKS = [
  {
    icon: Send,
    title: "Post what your community needs",
    body: "An organization, business, or individual shares an opportunity in under a minute — a job, volunteers, an event, a request for help.",
  },
  {
    icon: Search,
    title: "People discover it in one place",
    body: "One searchable feed across every organization and community member — filter by type and location instead of scrolling ten group chats.",
  },
  {
    icon: Users,
    title: "Connect and act",
    body: "Apply, RSVP, or offer help in a click. The poster sees who responded and can follow up directly.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-medium text-primary">
              A community network for the Ummah
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {APP_TAGLINE}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              {APP_DESCRIPTION}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/opportunities">
                  Explore Opportunities <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/opportunities/new">Post an Opportunity</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Muslim community resources are scattered across WhatsApp,
              Facebook, email, and flyers. Ummah Connect brings them into one
              place.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <h2 className="font-heading text-xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <Card key={step.title}>
              <CardContent className="space-y-3 pt-6">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Browse by type */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-xl font-semibold">
              Browse by type
            </h2>
            <Link
              href="/opportunities"
              className="text-sm font-medium text-primary hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {OPPORTUNITY_TYPES.map((type) => {
              const meta = OPPORTUNITY_TYPE_META[type];
              return (
                <Link
                  key={type}
                  href={`/opportunities?type=${type}`}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <meta.icon className="size-5" />
                  </span>
                  <span className="text-sm font-medium">{meta.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
