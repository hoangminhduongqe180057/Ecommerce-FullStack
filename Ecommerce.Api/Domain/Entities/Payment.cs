namespace Ecom.Api.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string Provider { get; set; } = default!;      // "payos" | "stripe" | "mock"
        public string ProviderPaymentId { get; set; } = default!; // sessionId/checkoutId
        public long Amount { get; set; }                      // tiền theo minor unit: VND => đồng
        public string Currency { get; set; } = "VND";
        public string Status { get; set; } = "pending";       // pending|paid|failed|cancelled|expired
        public string? CheckoutUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class PaymentEvent // idempotency chống xử lý lặp webhook
    {
        public Guid Id { get; set; }
        public Guid PaymentId { get; set; }
        public string ProviderEventId { get; set; } = default!;
        public string Type { get; set; } = default!;          // payment.succeeded, payment.failed...
        public string Raw { get; set; } = default!;           // jsonb
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
