using Ecom.Api.Domain.Entities;
using Ecom.Api.Dtos;

namespace Ecom.Api.Interface
{
    public interface IPaymentProvider
    {
        Task<(string checkoutUrl, string providerPaymentId)> CreateCheckoutAsync(Payment payment, Order order, CancellationToken ct);
        bool TryParseWebhook(HttpRequest request, string rawBody, out ProviderWebhookEvent evt); // kèm verify signature
    }

}
