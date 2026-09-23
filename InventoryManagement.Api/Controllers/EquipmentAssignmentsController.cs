using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin,staff")]
    public class EquipmentAssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EquipmentAssignmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/EquipmentAssignments
        // ADMIN + STAFF
        [HttpGet]
        public async Task<IActionResult> GetAssignments()
        {
            var assignments = await _context.EquipmentAssignments
                .Include(a => a.Equipment)
                .OrderByDescending(a => a.AssignedDate)
                .ToListAsync();

            return Ok(assignments);
        }

        // GET: api/EquipmentAssignments/1
        // ADMIN + STAFF
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssignment(int id)
        {
            var assignment = await _context.EquipmentAssignments
                .Include(a => a.Equipment)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Equipment assignment not found."
                });
            }

            return Ok(assignment);
        }

        // POST: api/EquipmentAssignments
        // ADMIN + STAFF
        [HttpPost]
        public async Task<IActionResult> CreateAssignment(
            EquipmentAssignment assignment)
        {
            if (string.IsNullOrWhiteSpace(assignment.AssignedTo))
            {
                return BadRequest(new
                {
                    message = "Assigned person is required."
                });
            }

            var equipment = await _context.Equipment
                .FirstOrDefaultAsync(e => e.Id == assignment.EquipmentId);

            if (equipment == null)
            {
                return BadRequest(new
                {
                    message = "Selected equipment does not exist."
                });
            }

            if (equipment.Quantity <= 0)
            {
                return BadRequest(new
                {
                    message = "No equipment is available for assignment."
                });
            }

            if (assignment.AssignedDate == default)
            {
                assignment.AssignedDate = DateTime.UtcNow;
            }
            else
            {
                assignment.AssignedDate = DateTime.SpecifyKind(
                    assignment.AssignedDate,
                    DateTimeKind.Utc);
            }

            assignment.Status = "Assigned";
            assignment.Id = 0;

            equipment.Quantity -= 1;

            _context.EquipmentAssignments.Add(assignment);

            var transaction = new StockTransaction
            {
                EquipmentId = equipment.Id,
                UserId = null,
                TransactionType = "OUT",
                Quantity = 1,
                TransactionDate = DateTime.UtcNow,
                Remarks = $"Equipment assigned to {assignment.AssignedTo}"
            };

            _context.StockTransactions.Add(transaction);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetAssignment),
                new { id = assignment.Id },
                assignment
            );
        }

        // PUT: api/EquipmentAssignments/1/return
        // ADMIN + STAFF
        [HttpPut("{id}/return")]
        public async Task<IActionResult> ReturnEquipment(int id)
        {
            var assignment = await _context.EquipmentAssignments
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Equipment assignment not found."
                });
            }

            if (assignment.Status == "Returned")
            {
                return BadRequest(new
                {
                    message = "This equipment has already been returned."
                });
            }

            var equipment = await _context.Equipment
                .FirstOrDefaultAsync(e => e.Id == assignment.EquipmentId);

            if (equipment == null)
            {
                return BadRequest(new
                {
                    message = "Assigned equipment no longer exists."
                });
            }

            equipment.Quantity += 1;

            assignment.ReturnedDate = DateTime.UtcNow;
            assignment.Status = "Returned";

            var transaction = new StockTransaction
            {
                EquipmentId = equipment.Id,
                UserId = null,
                TransactionType = "IN",
                Quantity = 1,
                TransactionDate = DateTime.UtcNow,
                Remarks = $"Equipment returned by {assignment.AssignedTo}"
            };

            _context.StockTransactions.Add(transaction);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Equipment returned successfully.",
                assignment
            });
        }

        // DELETE: api/EquipmentAssignments/1
        // ADMIN ONLY
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            var assignment = await _context.EquipmentAssignments
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Equipment assignment not found."
                });
            }

            if (assignment.Status == "Assigned")
            {
                var equipment = await _context.Equipment
                    .FirstOrDefaultAsync(e => e.Id == assignment.EquipmentId);

                if (equipment != null)
                {
                    equipment.Quantity += 1;

                    var transaction = new StockTransaction
                    {
                        EquipmentId = equipment.Id,
                        UserId = null,
                        TransactionType = "IN",
                        Quantity = 1,
                        TransactionDate = DateTime.UtcNow,
                        Remarks = $"Assignment deleted for {assignment.AssignedTo}"
                    };

                    _context.StockTransactions.Add(transaction);
                }
            }

            _context.EquipmentAssignments.Remove(assignment);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Equipment assignment deleted successfully."
            });
        }
    }
}