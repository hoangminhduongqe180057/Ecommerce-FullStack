namespace Ecom.Api.Dtos;

public record CartDto(
    List<CartLineDto> Items,
    decimal TotalAmount
);

public record CartLineDto(
    Guid ProductId, string Name, string? ImageUrl, decimal Price, int Quantity, decimal LineTotal
);

public record AddCartItemRequest(Guid ProductId, int Quantity);
public record UpdateCartItemRequest(int Quantity);
