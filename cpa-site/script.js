const WHATSAPP_NUMBER = "5500000000000";
const CHECKOUT_URLS = {
  Essencial: "",
  Completo: "",
  Premium: "",
};

function buildWhatsAppUrl(plan) {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no pacote ${plan} do material CPA Do Zero a Aprovação. Quero saber como funciona a compra, valores, entrega e formas de pagamento.`
  );

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

document.querySelectorAll("[data-plan]").forEach((link) => {
  const plan = link.getAttribute("data-plan");
  const checkoutUrl = CHECKOUT_URLS[plan];

  link.setAttribute("href", checkoutUrl || buildWhatsAppUrl(plan));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
});
