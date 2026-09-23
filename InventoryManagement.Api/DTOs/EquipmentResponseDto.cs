namespace InventoryManagement.Api.DTOs
{
    public class EquipmentResponseDto
    {
        public int Id { get; set; }

        public string EquipmentCode { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public int CategoryId { get; set; }

        public CategoryDto? Category { get; set; }

        public string? Brand { get; set; }

        public string? Model { get; set; }

        public string? SerialNumber { get; set; }

        public int? SupplierId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public int MinimumStock { get; set; }

        public DateTime? PurchaseDate { get; set; }

        public string Status { get; set; } = "Available";

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}