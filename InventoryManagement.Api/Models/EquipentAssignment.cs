namespace InventoryManagement.Api.Models;

public class EquipmentAssignment
{
    public int Id { get; set; }

    public int EquipmentId { get; set; }

    public Equipment? Equipment { get; set; }

    public string AssignedTo { get; set; } = string.Empty;

    public string? Department { get; set; }

    public DateTime AssignedDate { get; set; }

    public DateTime? ReturnedDate { get; set; }

    public string? Remarks { get; set; }

    public string Status { get; set; } = "Assigned";
}