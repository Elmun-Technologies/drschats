import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { twoProportionZ, type Variant, type ZTest } from "./ab";

/*
  A/B test results for admin → Vitrina. Per arm: exposures (visitor-days that
  saw it), distinct visitors, clicks (visitor-days that clicked), and the
  orders placed by exposed visitors after their first exposure (joined by
  the journey visitor id, orders.visitor_id) with their revenue.
*/

export interface ArmResult {
  id: number;
  variant: Variant;
  title: string;
  active: boolean;
  exposures: number;
  visitors: number;
  clicks: number;
  orders: number;
  revenue: number;
}

export interface ExperimentResult {
  key: string;
  placement: string;
  arms: Partial<Record<Variant, ArmResult>>;
  test: ZTest | null;
  /** Both arms exist and are switched on: the test is running. */
  running: boolean;
}

export async function experimentResults(): Promise<ExperimentResult[]> {
  const db = getDb();
  const arms = (await db.execute(sql`
    select b.id, b.experiment, b.variant, b.placement, b.title->>'uz' as title, b.active,
           count(e.banner_id) as exposures, count(distinct e.ab_id) as visitors, count(e.clicked_at) as clicks
    from banners b
    left join banner_exposures e on e.banner_id = b.id
    where b.experiment is not null
    group by b.id
    order by b.experiment, b.variant`)) as unknown as Record<string, string | number | boolean>[];
  if (arms.length === 0) return [];
  const sales = (await db.execute(sql`
    with first_seen as (
      select e.banner_id, e.visitor_id, min(e.created_at) as at
      from banner_exposures e join banners b on b.id = e.banner_id and b.experiment is not null
      where e.visitor_id is not null
      group by e.banner_id, e.visitor_id
    )
    select f.banner_id, count(distinct o.id) as orders, coalesce(sum(o.total), 0) as revenue
    from first_seen f
    join orders o on o.visitor_id = f.visitor_id and o.created_at >= f.at and o.status <> 'cancelled'
    group by f.banner_id`)) as unknown as { banner_id: string | number; orders: string; revenue: string }[];
  const salesOf = new Map(sales.map((s) => [Number(s.banner_id), s]));

  const byKey = new Map<string, ExperimentResult>();
  for (const a of arms) {
    const key = String(a.experiment);
    const variant = a.variant === "B" ? "B" : "A";
    const id = Number(a.id);
    const s = salesOf.get(id);
    const exp = byKey.get(key) ?? { key, placement: String(a.placement), arms: {}, test: null, running: false };
    exp.arms[variant] = {
      id,
      variant,
      title: String(a.title ?? ""),
      active: Boolean(a.active),
      exposures: Number(a.exposures),
      visitors: Number(a.visitors),
      clicks: Number(a.clicks),
      orders: Number(s?.orders ?? 0),
      revenue: Number(s?.revenue ?? 0),
    };
    byKey.set(key, exp);
  }
  for (const exp of byKey.values()) {
    const { A, B } = exp.arms;
    exp.running = Boolean(A?.active && B?.active);
    exp.test = A && B ? twoProportionZ({ exposures: A.exposures, clicks: A.clicks }, { exposures: B.exposures, clicks: B.clicks }) : null;
  }
  return [...byKey.values()];
}
