namespace InventoryManagement.Api.Models;

public class Sale
{
    public int Id { get; set; }

    public string SaleNumber { get; set; } = string.Empty;

    // Customer is optional
    public int? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public DateTime SaleDate { get; set; }

    public string Status { get; set; } = "Completed";

    public decimal Subtotal { get; set; }

    public decimal Tax { get; set; }

    public decimal Discount { get; set; }

    public decimal GrandTotal { get; set; }

    public string? Remarks { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
}