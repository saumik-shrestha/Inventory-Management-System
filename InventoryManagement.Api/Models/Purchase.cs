namespace InventoryManagement.Api.Models;

public class Purchase
{
    public int Id { get; set; }

    public string PurchaseNumber { get; set; } = string.Empty;

    public int SupplierId { get; set; }

    public Supplier? Supplier { get; set; }

    public string? InvoiceNumber { get; set; }

    public DateTime PurchaseDate { get; set; }

    public DateTime? ReceivedDate { get; set; }

    public string Status { get; set; } = "Pending";

    public decimal Subtotal { get; set; }

    public decimal Tax { get; set; }

    public decimal Discount { get; set; }

    public decimal OtherCharges { get; set; }

    public decimal GrandTotal { get; set; }

    public string? Remarks { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<PurchaseItem> Items { get; set; }
        = new List<PurchaseItem>();
}