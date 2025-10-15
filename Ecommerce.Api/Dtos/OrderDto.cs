namespace Ecom.Api.Dtos;

public record CreateOrderItem(Guid ProductId, int Quantity);
public record CreateOrderRequest(List<CreateOrderItem> Items);

public record OrderDto(
    Guid Id, Guid UserId, decimal TotalAmount, string Status,
    List<OrderLineDto> Items, DateTime CreatedAt
);

public record OrderLineDto(Guid ProductId, string Name, decimal UnitPrice, int Quantity, decimal LineTotal, string? ImageUrl);
