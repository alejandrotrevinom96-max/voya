import type { Activity } from "@/types";
import { formatCurrency } from "@/lib/utils/date";

interface BudgetSummaryProps {
  activities: Activity[];
  currency: string;
  travelers: number;
}

export default function BudgetSummary({
  activities,
  currency,
  travelers,
}: BudgetSummaryProps) {
  const added = activities.filter((a) => a.is_added);

  const totalMin = added.reduce(
    (sum, a) => sum + (a.estimated_price_min || 0) * travelers,
    0
  );
  const totalMax = added.reduce(
    (sum, a) => sum + (a.estimated_price_max || 0) * travelers,
    0
  );

  if (added.length === 0) {
    return (
      <div className="card-base text-center py-8">
        <div className="text-3xl mb-2">💰</div>
        <h3 className="font-display text-lg font-medium text-brown-dark mb-1">
          Tu presupuesto se construye aquí
        </h3>
        <p className="text-sm text-brown-soft">
          Agrega actividades a tu plan para ver tu presupuesto estimado.
        </p>
      </div>
    );
  }

  return (
    <div className="card-base bg-cream-warm border-terracotta-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-medium text-brown-dark">
          Presupuesto estimado
        </h3>
        <span className="text-xs text-brown-soft">
          {added.length} {added.length === 1 ? "actividad" : "actividades"}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
            Por persona
          </p>
          <p className="font-display text-2xl text-brown-dark">
            {formatCurrency(totalMin / travelers, currency)}
            {totalMax !== totalMin && (
              <span className="text-brown-soft text-base font-light">
                {" "}
                – {formatCurrency(totalMax / travelers, currency)}
              </span>
            )}
          </p>
        </div>

        {travelers > 1 && (
          <div className="pt-3 border-t border-sand-dark">
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
              Total ({travelers} personas)
            </p>
            <p className="font-display italic text-3xl text-terracotta">
              {formatCurrency(totalMin, currency)}
              {totalMax !== totalMin && (
                <span className="text-brown-mid text-xl">
                  {" "}
                  – {formatCurrency(totalMax, currency)}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-brown-soft mt-4 leading-relaxed">
        ✦ Estimaciones aproximadas generadas por AI. No incluyen vuelos,
        hospedaje ni transporte.
      </p>
    </div>
  );
}
