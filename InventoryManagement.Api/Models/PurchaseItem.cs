namespace InventoryManagement.Api.Models;

public class PurchaseItem
{
    public int Id { get; set; }

    public int PurchaseId { get; set; }

    public Purchase? Purchase { get; set; }

    public int EquipmentId { get; set; }

    public Equipment? Equipment { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }

    public decimal Total { get; set; }
}