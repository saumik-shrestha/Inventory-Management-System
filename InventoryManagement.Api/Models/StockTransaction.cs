namespace InventoryManagement.Api.Models;

public class StockTransaction
{
    public int Id { get; set; }

    public int EquipmentId { get; set; }

    public Equipment? Equipment { get; set; }

    public int? UserId { get; set; }

    public User? User { get; set; }

    public string TransactionType { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public DateTime TransactionDate { get; set; }

    public string? Remarks { get; set; }
}