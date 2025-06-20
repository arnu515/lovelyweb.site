import { Flower, Sparkle, Zap } from 'lucide-svelte';

export type PLAN = 'free' | 'basic' | 'pro';

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for small teams getting started',
    price: { usd: 0 },
    priceYearly: { usd: 0 },
    features: [
      'Up to 5 Team Members',
      '100 emails per month per user',
      'Basic AI Models',
      '5 AI video meetings per month',
      '15 AI audio conversations per month',
      'Standard chat features',
      'Standard search features',
      '100MB storage'
    ],
    icon: Flower,
    gradient: 'from-gray-500 to-gray-600',
    cta: 'Start for Free'
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for growing teams',
    price: { usd: 10 },
    priceYearly: { usd: 100 },
    features: [
      'Up to 20 Team Members',
      'Unlimited emails per month',
      'Advanced AI Models',
      '20 AI video meetings per month',
      '60 AI audio conversations per month',
      'All chat features',
      'All search features',
      '5GB storage'
    ],
    icon: Sparkle,
    gradient: 'from-blue-500 to-cyan-500',
    cta: 'Get Started'
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Perfect for large teams and organisations',
    price: { usd: 50 },
    priceYearly: { usd: 500 },
    features: [
      'Up to 1000 Team Members',
      'Unlimited Emails',
      'The best AI Models',
      '100 AI video meetings per month',
      '500 audio conversations per month',
      'All chat features',
      'All search features',
      '20GB storage'
    ],
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    cta: 'Get Started'
  }
] as const;

export const PLANS_BY_ID = {
  free: PLANS[0],
  basic: PLANS[1],
  pro: PLANS[2]
} as const;
