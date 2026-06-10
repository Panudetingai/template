import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: ["Up to 3 projects", "Community support", "Basic analytics"],
    cta: "Current plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export default function page() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Upgrade your plan
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose the plan that fits your team.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "ring-2 ring-primary" : undefined}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.highlighted && <Sparkles className="size-4 text-primary" />}
                {plan.name}
              </CardTitle>
              <CardDescription>
                <span className="font-heading text-2xl font-semibold text-foreground">
                  {plan.price}
                </span>
                {plan.period}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                disabled={!plan.highlighted}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
