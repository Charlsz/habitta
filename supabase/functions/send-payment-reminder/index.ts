import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const APP_URL = Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "https://habitta.vercel.app";

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00Z");
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  try {
    const { payment } = await req.json();

    if (!payment) {
      return Response.json({ error: "payment requerido" }, { status: 400 });
    }

    const days    = daysUntil(payment.due_date);
    const dueDate = new Date(payment.due_date + "T00:00:00Z").toLocaleDateString("es-CO", {
      day: "numeric", month: "long", year: "numeric",
    });

    let urgencyLine = "";
    if (payment.status === "overdue") {
      urgencyLine = `⚠️ *Tu pago está VENCIDO.* Por favor regúlariza tu situación a la brevedad.`;
    } else if (days === 0) {
      urgencyLine = `🚨 *¡Tu pago vence HOY!* No lo dejes para después.`;
    } else if (days <= 3) {
      urgencyLine = `⏰ *¡Solo te quedan ${days} día${days === 1 ? "" : "s"}!* Realiza tu pago pronto.`;
    } else {
      urgencyLine = `📅 Tienes *${days} días* para realizar el pago.`;
    }

    const payLink = `${APP_URL}/pay/${payment.id}`;

    const message =
`🏠 *Recordatorio de pago — Habitta*

Hola *${payment.resident_name}*,

Tienes un pago pendiente:

📋 *Concepto:* ${payment.concept}
💰 *Monto:* ${formatCOP(payment.amount)}
📆 *Fecha límite:* ${dueDate}

${urgencyLine}

👉 [Pagar ahora](${payLink})

_Habitta · Sistema de gestión residencial_`;

    const chatId = payment.telegram_chat_id;

    if (!chatId || !TELEGRAM_BOT_TOKEN) {
      console.log("[DEMO] Telegram message would be sent:", message);
      return Response.json({
        ok: true,
        message: "Reminder enviado (modo demo)",
        preview: message,
        payLink,
      }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
      }
    );

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      return Response.json({ ok: false, error: tgData.description }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    return Response.json({ ok: true, message: "Enlace de pago enviado por Telegram" }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (err: any) {
    return Response.json({ ok: false, error: err.message }, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});
