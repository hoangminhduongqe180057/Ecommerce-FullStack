using Ecom.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
// ↓↓↓ giữ lại 2 using bạn đã thêm ↓↓↓
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Ecom.Api.Infrastructure
{
    public class AppDbContext(DbContextOptions<AppDbContext> opts) : DbContext(opts)
    {
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<Order> Orders => Set<Order>();

        // ⬇️ THÊM 2 DbSet
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<PaymentEvent> PaymentEvents => Set<PaymentEvent>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            // ===== PRODUCT =====
            b.Entity<Product>(e =>
            {
                e.ToTable("products");
                e.HasKey(x => x.Id);
                e.Property(x => x.Price).HasColumnType("numeric(12,2)");
                e.HasIndex(x => x.Name);
            });

            // ===== CART =====
            var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
            var cartItemsConverter = new ValueConverter<List<CartItem>, string>(
                v => JsonSerializer.Serialize(v ?? new List<CartItem>(), jsonOptions),
                v => string.IsNullOrWhiteSpace(v)
                        ? new List<CartItem>()
                        : (JsonSerializer.Deserialize<List<CartItem>>(v, jsonOptions) ?? new List<CartItem>())
            );

            b.Entity<Cart>(e =>
            {
                e.ToTable("carts");
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.UserId).IsUnique();

                e.Property(x => x.Items)
                    .HasConversion(cartItemsConverter)
                    .HasColumnType("jsonb")
                    .HasDefaultValueSql("'[]'::jsonb")
                    .IsRequired();

                e.Property(x => x.UpdatedAt)
                    .HasDefaultValueSql("now() at time zone 'utc'");
            });

            // ===== ORDER =====
            b.Entity<Order>(e =>
            {
                e.ToTable("orders");
                e.HasKey(x => x.Id);
                e.HasIndex(x => new { x.UserId, x.CreatedAt });
                e.Property(x => x.Status).HasMaxLength(20);
                e.Property(x => x.Products).HasColumnType("jsonb");
                e.Property(x => x.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");
                e.Property(x => x.UpdatedAt).HasDefaultValueSql("now() at time zone 'utc'");
            });

            // ===== PAYMENT =====
            b.Entity<Payment>(e =>
            {
                e.ToTable("payments");
                e.HasKey(x => x.Id);

                // FK -> orders
                e.HasOne<Order>()
                 .WithMany()
                 .HasForeignKey(x => x.OrderId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.Property(x => x.Provider).HasMaxLength(20).IsRequired();
                e.Property(x => x.ProviderPaymentId).HasMaxLength(100).IsRequired();
                e.Property(x => x.Amount).HasColumnType("bigint").IsRequired(); // minor unit (đồng)
                e.Property(x => x.Currency).HasMaxLength(10).HasDefaultValue("VND");
                e.Property(x => x.Status).HasMaxLength(20).HasDefaultValue("pending");
                e.Property(x => x.CheckoutUrl).HasMaxLength(1000);

                e.Property(x => x.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");
                e.Property(x => x.UpdatedAt).HasDefaultValueSql("now() at time zone 'utc'");

                e.HasIndex(x => x.OrderId);
                e.HasIndex(x => new { x.Provider, x.ProviderPaymentId }).IsUnique();
            });

            // ===== PAYMENT_EVENT =====
            b.Entity<PaymentEvent>(e =>
            {
                e.ToTable("payment_events");
                e.HasKey(x => x.Id);

                e.Property(x => x.ProviderEventId).HasMaxLength(200).IsRequired();
                e.Property(x => x.Type).HasMaxLength(100).IsRequired();
                e.Property(x => x.Raw).HasColumnType("jsonb").IsRequired();

                e.Property(x => x.CreatedAt).HasDefaultValueSql("now() at time zone 'utc'");

                e.HasIndex(x => x.PaymentId);
                e.HasIndex(x => x.ProviderEventId).IsUnique();
            });
        }

        public override Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            var utcNow = DateTime.UtcNow;

            foreach (var e in ChangeTracker.Entries<Product>())
            {
                if (e.State == EntityState.Added) e.Entity.CreatedAt = utcNow;
                if (e.State == EntityState.Modified) e.Entity.UpdatedAt = utcNow;
            }

            foreach (var e in ChangeTracker.Entries<Cart>())
                if (e.State == EntityState.Modified) e.Entity.UpdatedAt = utcNow;

            foreach (var e in ChangeTracker.Entries<Order>())
                if (e.State == EntityState.Modified) e.Entity.UpdatedAt = utcNow;

            // ⬇️ THÊM timestamps cho Payment
            foreach (var e in ChangeTracker.Entries<Payment>())
            {
                if (e.State == EntityState.Added) e.Entity.CreatedAt = utcNow;
                if (e.State == EntityState.Modified) e.Entity.UpdatedAt = utcNow;
            }
            // PaymentEvent chỉ có CreatedAt (đã dùng default DB)

            return base.SaveChangesAsync(ct);
        }
    }
}
