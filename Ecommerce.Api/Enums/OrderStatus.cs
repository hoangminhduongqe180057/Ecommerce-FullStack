namespace Ecom.Api.Enums
{
    public enum OrderStatus { pending, paid, cancelled }

    public record UpdateStatusRequest(OrderStatus Status);

}
