namespace Ecom.Api.Dtos;

public record CreateProductRequest(
    string Name,
    string Description,
    decimal Price,
    string? ImageUrl
);

public record UpdateProductRequest(
    string? Name,
    string? Description,
    decimal? Price,
    string? ImageUrl
);
