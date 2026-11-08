import "server-only";

import { readLoyaltyRules } from "@/lib/loyalty/settings";
import { pointsBalance } from "@/lib/loyalty/server";
import { ensureReferralCode } from "@/lib/referral/server";

/*
  The club card, the same in the bot («⭐ Klub») and in the website cabinet:
  what this phone has today. Every programme is off until /admin/loyalty
  turns it on, and a switched-off one is simply not in the card.
*/
export interface ClubCard {
  points: { balance: number; earnPercent: number; maxSharePercent: number } | null;
  referral: { code: string | null; friendPercent: number; reward: "points" | "promo"; rewardPoints: number; rewardPercent: number } | null;
}

export async function clubCard(phone9: string): Promise<ClubCard> {
  const rules = await readLoyaltyRules();
  const [balance, code] = await Promise.all([
    rules.enabled ? pointsBalance(phone9) : Promise.resolve(0),
    rules.referral.enabled ? ensureReferralCode(phone9) : Promise.resolve(null),
  ]);
  return {
    points: rules.enabled ? { balance: Math.max(0, balance), earnPercent: rules.earnPercent, maxSharePercent: rules.maxSharePercent } : null,
    referral: rules.referral.enabled
      ? {
          code,
          friendPercent: rules.referral.friendPercent,
          reward: rules.enabled ? rules.referral.reward : "promo",
          rewardPoints: rules.referral.rewardPoints,
          rewardPercent: rules.referral.rewardPercent,
        }
      : null,
  };
}
