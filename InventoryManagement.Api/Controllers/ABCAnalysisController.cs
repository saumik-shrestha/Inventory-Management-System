using InventoryManagement.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin,staff")]
    public class ABCAnalysisController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ABCAnalysisController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ABCAnalysis
        // ADMIN + STAFF
        [HttpGet]
        public async Task<IActionResult> GetABCAnalysis()
        {
            // Get all OUT transactions
            var transactions = await _context.StockTransactions
                .Where(t => t.TransactionType == "OUT")
                .Include(t => t.Equipment)
                .ToListAsync();

            // Calculate consumption value for each equipment
            var analysis = transactions
                .GroupBy(t => t.EquipmentId)
                .Select(g =>
                {
                    var equipment = g.First().Equipment;

                    var quantityIssued = g.Sum(t => t.Quantity);

                    var annualConsumptionValue =
                        quantityIssued * (equipment?.UnitPrice ?? 0);

                    return new
                    {
                        EquipmentId = g.Key,
                        EquipmentCode = equipment?.EquipmentCode,
                        EquipmentName = equipment?.Name,
                        UnitPrice = equipment?.UnitPrice ?? 0,
                        QuantityIssued = quantityIssued,
                        AnnualConsumptionValue = annualConsumptionValue
                    };
                })
                .OrderByDescending(x => x.AnnualConsumptionValue)
                .ToList();

            // Calculate total consumption value
            var totalValue = analysis
                .Sum(x => x.AnnualConsumptionValue);

            // Calculate cumulative percentage
            // and ABC classification
            var result = new List<object>();

            decimal cumulativePercentage = 0;

            foreach (var item in analysis)
            {
                decimal percentage = totalValue > 0
                    ? (item.AnnualConsumptionValue / totalValue) * 100
                    : 0;

                cumulativePercentage += percentage;

                string classification;

                if (cumulativePercentage <= 80)
                {
                    classification = "A";
                }
                else if (cumulativePercentage <= 95)
                {
                    classification = "B";
                }
                else
                {
                    classification = "C";
                }

                result.Add(new
                {
                    item.EquipmentId,
                    item.EquipmentCode,
                    item.EquipmentName,
                    item.UnitPrice,
                    item.QuantityIssued,
                    item.AnnualConsumptionValue,
                    Percentage = Math.Round(percentage, 2),
                    CumulativePercentage =
                        Math.Round(cumulativePercentage, 2),
                    Classification = classification
                });
            }

            return Ok(result);
        }
    }
}