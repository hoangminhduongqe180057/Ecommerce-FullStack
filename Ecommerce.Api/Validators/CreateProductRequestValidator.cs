using Ecom.Api.Dtos;
using FluentValidation;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.ImageUrl).MaximumLength(1000).When(x => x.ImageUrl is not null);
    }
}

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        When(x => x.Name is not null, () =>
            RuleFor(x => x.Name!).NotEmpty().MaximumLength(100));
        When(x => x.Description is not null, () =>
            RuleFor(x => x.Description!).NotEmpty().MaximumLength(2000));
        When(x => x.Price is not null, () =>
            RuleFor(x => x.Price!.Value).GreaterThan(0));
        When(x => x.ImageUrl is not null, () =>
            RuleFor(x => x.ImageUrl!).MaximumLength(1000));
    }
}
