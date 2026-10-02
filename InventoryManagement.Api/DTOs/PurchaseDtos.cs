namespace InventoryManagement.Api.DTOs;

public class CreatePurchaseDto
{
    public int SupplierId { get; set; }

    public string? InvoiceNumber { get; set; }

    public DateTime PurchaseDate { get; set; }

    public DateTime? ReceivedDate { get; set; }

    public string Status { get; set; } = "Pending";

    public decimal Tax { get; set; }

    public decimal Discount { get; set; }

    public decimal OtherCharges { get; set; }

    public string? Remarks { get; set; }

    public List<CreatePurchaseItemDto> Items { get; set; }
        = new List<CreatePurchaseItemDto>();
}

public class CreatePurchaseItemDto
{
    public int EquipmentId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }
}


// -----------------------------
// RESPONSE DTOs
// -----------------------------

public class PurchaseResponseDto
{
    public int Id { get; set; }

    public string PurchaseNumber { get; set; } = string.Empty;

    public int SupplierId { get; set; }

    public string SupplierName { get; set; } = string.Empty;

    public string? InvoiceNumber { get; set; }

    public DateTime PurchaseDate { get; set; }

    public DateTime? ReceivedDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }

    public decimal Tax { get; set; }

    public decimal Discount { get; set; }

    public decimal OtherCharges { get; set; }

    public decimal GrandTotal { get; set; }

    public string? Remarks { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<PurchaseItemResponseDto> Items { get; set; }
        = new List<PurchaseItemResponseDto>();
}


public class PurchaseItemResponseDto
{
    public int Id { get; set; }

    public int EquipmentId { get; set; }

    public string EquipmentName { get; set; } = string.Empty;

    public string EquipmentCode { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }

    public decimal Total { get; set; }
}