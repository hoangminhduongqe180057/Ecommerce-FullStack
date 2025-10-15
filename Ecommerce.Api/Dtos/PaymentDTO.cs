namespace Ecom.Api.Dtos
{
    public record CreatePaymentRequest(Guid OrderId, string? Provider = "mock");
    public record CreatePaymentResponse(Guid PaymentId, string CheckoutUrl);

    public record ProviderWebhookEvent(string Id, string Type, string ProviderPaymentId, long Amount, string Currency, string RawJson);

}
